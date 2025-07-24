// Free AI Service for Banking Chatbot
// Using multiple AI sources: Online APIs (Cohere, Hugging Face) and enhanced rule-based

import axios from 'axios';

export const getFreeAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Call the correct GET API endpoint
    // If you get a 403 error, check your backend CORS settings and required headers
    const response = await axios.get('http://localhost:8080/ai/generate', {
      params: { message: userMessage }
      // headers: { 'Authorization': 'Bearer YOUR_TOKEN' } // Uncomment if your backend requires auth
    });
    let aiText = response.data.text || response.data || '';
    if (typeof aiText !== 'string') aiText = String(aiText);
    // Remove <b> and </b> tags from the response
    aiText = aiText.replace(/<b>/g, '').replace(/<\/b>/g, '');
    const quickReplies = extractQuickReplies(aiText, userMessage);
    return {
      text: aiText,
      quickReplies
    };
  } catch (error) {
    console.error('Error calling chatbot API:', error);
    return {
      text: "I'm having trouble processing your request right now. Please try again or contact our support team.",
      quickReplies: ['Try Again', 'Contact Support', 'Help']
    };
  }
};

// Extract quick replies based on AI response
const extractQuickReplies = (aiResponse, userMessage) => {
  const lowerResponse = aiResponse.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  const quickReplies = [];
  if (lowerResponse.includes('balance') || lowerUserMessage.includes('balance')) {
    quickReplies.push('View Transactions', 'Transfer Money', 'Account Statement');
  }
  if (lowerResponse.includes('transfer') || lowerUserMessage.includes('transfer')) {
    quickReplies.push('Domestic Transfer', 'International Transfer', 'Bill Payment');
  }
  if (lowerResponse.includes('card') || lowerUserMessage.includes('card')) {
    quickReplies.push('Block Card', 'Card Status', 'Report Lost Card');
  }
  if (lowerResponse.includes('security') || lowerResponse.includes('password')) {
    quickReplies.push('Change Password', 'Enable 2FA', 'Security Alerts');
  }
  if (lowerResponse.includes('loan') || lowerUserMessage.includes('loan')) {
    quickReplies.push('Personal Loan', 'Home Loan', 'Business Loan');
  }
  if (lowerResponse.includes('investment') || lowerResponse.includes('invest')) {
    quickReplies.push('Fixed Deposits', 'Mutual Funds', 'Investment Plans');
  }
  if (quickReplies.length === 0) {
    quickReplies.push('Account Balance', 'Transfer Money', 'Help', 'Contact Support');
  }
  return quickReplies.slice(0, 4);
};

export const isFreeAIAvailable = () => true;

export default {
  getFreeAIResponse,
  isFreeAIAvailable
}; 