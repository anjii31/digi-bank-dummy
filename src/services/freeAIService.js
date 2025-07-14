// Free AI Service for Banking Chatbot
// Using multiple AI sources: Online APIs (Cohere, Hugging Face) and enhanced rule-based

import axios from 'axios';

// Check if Hugging Face is available
const isHuggingFaceAvailable = () => {
  try {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    return apiKey && apiKey.length > 10;
  } catch (error) {
    console.log('Hugging Face not available:', error.message);
    return false;
  }
};

// Check if Cohere AI is available
const isCohereAvailable = () => {
  try {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    return apiKey && apiKey.length > 10;
  } catch (error) {
    console.log('Cohere AI not available:', error.message);
    return false;
  }
};

export const getFreeAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Try Cohere AI first (more reliable free tier)
    if (isCohereAvailable()) {
      try {
        console.log('Trying Cohere AI...');
        
        const cohereResponse = await axios.post(
          'https://api.cohere.ai/v1/generate',
          {
            model: 'command-light',
            prompt: `You are a helpful banking assistant. Respond to this banking question: ${userMessage}`,
            max_tokens: 150,
            temperature: 0.7,
            k: 0,
            stop_sequences: [],
            return_likelihoods: 'NONE'
          },
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log('Cohere AI response received:', cohereResponse.data);

        if (cohereResponse.data && cohereResponse.data.generations && cohereResponse.data.generations[0]) {
          const aiResponse = cohereResponse.data.generations[0].text.trim();
          
          if (aiResponse.length > 10) {
            const quickReplies = extractQuickReplies(aiResponse, userMessage);
            return {
              text: aiResponse,
              quickReplies: quickReplies
            };
          }
        }
      } catch (cohereError) {
        console.error('Cohere AI failed:', cohereError.message);
      }
    }

    // Try Hugging Face models
    if (isHuggingFaceAvailable()) {
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      console.log('API Key available:', apiKey ? `hf_${apiKey.substring(3, 8)}...` : 'No API key');

      // Try multiple reliable AI models
      const models = [
        {
          name: 'GPT-2 Small',
          url: 'https://api-inference.huggingface.co/models/gpt2',
          input: `Banking Assistant: ${userMessage}\nResponse:`,
          cleanup: `Banking Assistant: ${userMessage}\nResponse:`
        },
        {
          name: 'DistilGPT-2',
          url: 'https://api-inference.huggingface.co/models/distilgpt2',
          input: `Banking Assistant: ${userMessage}\nResponse:`,
          cleanup: `Banking Assistant: ${userMessage}\nResponse:`
        },
        {
          name: 'Tiny GPT-2',
          url: 'https://api-inference.huggingface.co/models/sshleifer/tiny-gpt2',
          input: `Banking Assistant: ${userMessage}\nResponse:`,
          cleanup: `Banking Assistant: ${userMessage}\nResponse:`
        }
      ];

      // Try each model until one works
      for (const model of models) {
        try {
          console.log(`Trying ${model.name}...`);
          
          const response = await axios.post(
            model.url,
            {
              inputs: model.input,
              parameters: {
                max_length: 100,
                temperature: 0.8,
                do_sample: true,
                top_p: 0.9,
                return_full_text: false
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 12000
            }
          );

          console.log(`${model.name} response received:`, response.data);

          // Extract the generated text
          let aiResponse = '';
          if (response.data && response.data[0] && response.data[0].generated_text) {
            aiResponse = response.data[0].generated_text;
            // Clean up the response
            aiResponse = aiResponse.replace(model.cleanup, '').trim();
            
            // If the response is too short or unclear, try next model
            if (aiResponse.length < 10) {
              console.log(`${model.name} response too short, trying next model...`);
              continue;
            }
          } else {
            console.log(`${model.name} response format unexpected, trying next model...`);
            continue;
          }

          // Extract quick replies based on the response
          const quickReplies = extractQuickReplies(aiResponse, userMessage);

          return {
            text: aiResponse,
            quickReplies: quickReplies
          };

        } catch (modelError) {
          console.error(`${model.name} failed:`, modelError.message);
          
          // Log detailed error information
          if (modelError.response) {
            console.error('Error Status:', modelError.response.status);
            console.error('Error Data:', modelError.response.data);
          }
          
          // Continue to next model
          continue;
        }
      }
    }

    // If all AI models failed, use enhanced rule-based responses
    console.log('All AI models failed, using enhanced rule-based responses');
    const enhancedResponse = getEnhancedResponse(userMessage);
    const quickReplies = extractQuickReplies(enhancedResponse.text, userMessage);

    return {
      text: enhancedResponse.text,
      quickReplies: quickReplies
    };

  } catch (error) {
    console.error('Free AI Service Error:', error);
    
    // Log specific error details for debugging
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Response:', error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 404) {
        console.error('Model not found or unavailable. Using fallback...');
      } else if (error.response.status === 503) {
        console.error('Model is loading. Using fallback...');
      } else if (error.response.status === 429) {
        console.error('Rate limit exceeded. Using fallback...');
      } else if (error.response.status === 401) {
        console.error('Unauthorized - check your API key');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Using fallback...');
    }
    
    // Fallback to enhanced rule-based responses
    const enhancedResponse = getEnhancedResponse(userMessage);
    const quickReplies = extractQuickReplies(enhancedResponse.text, userMessage);

    return {
      text: enhancedResponse.text,
      quickReplies: quickReplies
    };
  }
};

// Extract quick replies based on AI response
const extractQuickReplies = (aiResponse, userMessage) => {
  const lowerResponse = aiResponse.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  const quickReplies = [];

  // Balance related
  if (lowerResponse.includes('balance') || lowerUserMessage.includes('balance')) {
    quickReplies.push('View Transactions', 'Transfer Money', 'Account Statement');
  }
  
  // Transfer related
  if (lowerResponse.includes('transfer') || lowerUserMessage.includes('transfer')) {
    quickReplies.push('Domestic Transfer', 'International Transfer', 'Bill Payment');
  }
  
  // Card related
  if (lowerResponse.includes('card') || lowerUserMessage.includes('card')) {
    quickReplies.push('Block Card', 'Card Status', 'Report Lost Card');
  }
  
  // Security related
  if (lowerResponse.includes('security') || lowerResponse.includes('password')) {
    quickReplies.push('Change Password', 'Enable 2FA', 'Security Alerts');
  }
  
  // Loan related
  if (lowerResponse.includes('loan') || lowerUserMessage.includes('loan')) {
    quickReplies.push('Personal Loan', 'Home Loan', 'Business Loan');
  }
  
  // Investment related
  if (lowerResponse.includes('investment') || lowerResponse.includes('invest')) {
    quickReplies.push('Fixed Deposits', 'Mutual Funds', 'Investment Plans');
  }
  
  // General help
  if (quickReplies.length === 0) {
    quickReplies.push('Account Balance', 'Transfer Money', 'Help', 'Contact Support');
  }

  return quickReplies.slice(0, 4);
};

// Enhanced rule-based responses that simulate AI
const getEnhancedResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Investment-related queries - expanded keywords
  if (lowerMessage.includes('investment') || lowerMessage.includes('invest') || 
      lowerMessage.includes('options') || lowerMessage.includes('funds') || 
      lowerMessage.includes('deposit') || lowerMessage.includes('savings') ||
      lowerMessage.includes('mutual') || lowerMessage.includes('bonds')) {
    const responses = [
      "I'd be happy to help you with investment options! We offer several investment products including fixed deposits with competitive interest rates (6.5-7.2%), mutual funds for diversified portfolios, and government bonds for secure investments. What type of investment are you considering?",
      "Great question about investments! We have fixed deposits starting at 6.5% interest, mutual funds with various risk profiles (equity, debt, hybrid), and government securities. Would you like to know more about any specific investment type?",
      "For investment options, we offer fixed deposits (6.5-7.2% interest), mutual funds (equity, debt, hybrid), and government bonds. Each has different risk levels and returns. What's your investment goal?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['Fixed Deposits', 'Mutual Funds', 'Investment Plans', 'Interest Rates']
    };
  }
  
  // Balance-related queries - expanded keywords
  if (lowerMessage.includes('balance') || lowerMessage.includes('account') || 
      lowerMessage.includes('money') || lowerMessage.includes('amount') ||
      lowerMessage.includes('how much') || lowerMessage.includes('current')) {
    const responses = [
      "Your current account balance is $24,567.89. Your recent transactions show deposits and regular payments. You can view detailed transaction history in your dashboard.",
      "I can see your account balance is $24,567.89. You have 3 pending transactions totaling $1,234.56. Would you like to see your recent activity?",
      "Your account shows a balance of $24,567.89. You've had 12 transactions this month. Your account is in good standing with no overdraft fees."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['View Transactions', 'Transfer Money', 'Account Statement']
    };
  }
  
  // Transfer-related queries - expanded keywords
  if (lowerMessage.includes('transfer') || lowerMessage.includes('send money') || 
      lowerMessage.includes('send') || lowerMessage.includes('pay') ||
      lowerMessage.includes('wire') || lowerMessage.includes('payment')) {
    const responses = [
      "I can help you with money transfers! We offer instant domestic transfers, international wire transfers, and bill payments. Domestic transfers are usually instant, while international transfers take 1-3 business days.",
      "For money transfers, you have several options: instant domestic transfers (free), international wire transfers ($25 fee), and bill payments. What type of transfer do you need?",
      "Transfer options include: domestic transfers (instant, free), international transfers (1-3 days, $25 fee), and bill payments. Your daily transfer limit is $10,000."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['Domestic Transfer', 'International Transfer', 'Bill Payment', 'Quick Transfer']
    };
  }
  
  // Card-related queries - expanded keywords
  if (lowerMessage.includes('card') || lowerMessage.includes('debit') || 
      lowerMessage.includes('credit') || lowerMessage.includes('atm') ||
      lowerMessage.includes('plastic') || lowerMessage.includes('lost card')) {
    const responses = [
      "I can help you with card services! You can block/unblock your card instantly, check card status, report lost/stolen cards, or adjust spending limits. Your card is currently active.",
      "For card services, you can manage your debit card settings, report issues, or request a replacement. Your current card has a daily spending limit of $5,000.",
      "Card services include: blocking/unblocking, checking status, reporting lost cards, and adjusting limits. Your card is in good standing with no recent suspicious activity."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['Block Card', 'Card Status', 'Report Lost Card', 'Card Limits']
    };
  }
  
  // Security-related queries - expanded keywords
  if (lowerMessage.includes('security') || lowerMessage.includes('password') || 
      lowerMessage.includes('secure') || lowerMessage.includes('safe') ||
      lowerMessage.includes('protect') || lowerMessage.includes('2fa') ||
      lowerMessage.includes('two factor')) {
    const responses = [
      "Your account security is our top priority! You can change your password, enable two-factor authentication, set up security alerts, or review login history. Your account shows no suspicious activity.",
      "For security, you can update your password, enable 2FA, set up alerts for unusual transactions, or review recent login activity. Your account has strong security settings enabled.",
      "Security options include: password changes, 2FA setup, transaction alerts, and login monitoring. Your account shows no security concerns at this time."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['Change Password', 'Enable 2FA', 'Security Alerts', 'Login History']
    };
  }
  
  // Loan-related queries - expanded keywords
  if (lowerMessage.includes('loan') || lowerMessage.includes('borrow') || 
      lowerMessage.includes('credit') || lowerMessage.includes('mortgage') ||
      lowerMessage.includes('personal loan') || lowerMessage.includes('home loan')) {
    const responses = [
      "I can help you with loan information! We offer personal loans (up to $50,000), home loans (up to $500,000), and business loans. Current interest rates start at 8.5% for personal loans.",
      "For loans, we have personal loans (8.5-12% interest), home loans (6.5-8% interest), and business loans. Each has different eligibility criteria and documentation requirements.",
      "Loan options include: personal loans (quick approval), home loans (competitive rates), and business loans (flexible terms). What type of loan are you considering?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['Personal Loan', 'Home Loan', 'Business Loan', 'Loan Calculator']
    };
  }
  
  // Specific questions about services
  if (lowerMessage.includes('what') || lowerMessage.includes('how') || 
      lowerMessage.includes('can you') || lowerMessage.includes('help me')) {
    const responses = [
      "I'm here to help with your banking needs! You can ask me about account balance, transfers, cards, security, loans, investments, or any other banking services.",
      "Welcome to DigiBank Assistant! I can help you with account information, money transfers, card services, security settings, loans, and investments. What would you like to know?",
      "Hello! I'm your banking assistant. I can help with balance inquiries, transfers, card management, security settings, loans, and investment options. How can I assist you today?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: ['Account Balance', 'Transfer Money', 'Card Services', 'Security']
    };
  }
  
  // If no specific keywords match, provide a more helpful response
  return {
    text: "I understand you're asking about banking services. Could you please be more specific? I can help with: account balance, money transfers, card services, security settings, loans, or investment options. What would you like to know?",
    quickReplies: ['Account Balance', 'Transfer Money', 'Card Services', 'Investment Options']
  };
};

// Export utility functions
export const isFreeAIAvailable = () => {
  return isCohereAvailable() || isHuggingFaceAvailable();
};

export default {
  getFreeAIResponse,
  isFreeAIAvailable
}; 