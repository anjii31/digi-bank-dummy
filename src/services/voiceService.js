// Voice Service for DigiBank Application
// Provides speech recognition and text-to-speech capabilities

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.lastSpokenText = '';
    this.speechTimeout = null;
    this.language = 'en-US'; // default
    this.initSpeechRecognition();
  }

  setLanguage(lang) {
    // Accepts 'en', 'hi', 'mr' and maps to BCP-47 codes
    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.language = langMap[lang] || 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.language;
    }
  }

  // Initialize speech recognition
  initSpeechRecognition() {
    try {
      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = 1;
        
        // Set up event handlers
        this.recognition.onstart = () => {
          this.isListening = true;
          console.log('Voice recognition started');
          if (this.onStartCallback) this.onStartCallback();
        };
        
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Voice input received:', transcript);
          this.isListening = false;
          
          // Check if the transcript matches what we just spoke
          if (this.lastSpokenText && transcript.toLowerCase().includes(this.lastSpokenText.toLowerCase())) {
            console.log('Ignoring own speech feedback');
            return;
          }
          
          // Ignore common feedback words
          const ignoreWords = ['listening', 'processing', 'speaking', 'voice', 'assistant'];
          const lowerTranscript = transcript.toLowerCase();
          if (ignoreWords.some(word => lowerTranscript.includes(word))) {
            console.log('Ignoring feedback words:', transcript);
            return;
          }
          
          if (this.onResultCallback) this.onResultCallback(transcript);
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.isListening = false;
          if (this.onErrorCallback) this.onErrorCallback(event.error);
        };
        
        this.recognition.onend = () => {
          this.isListening = false;
          console.log('Voice recognition ended');
          if (this.onEndCallback) this.onEndCallback();
        };
        
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  }

  // Start listening for voice input
  startListening(onResult, onError, onStart, onEnd) {
    if (!this.recognition) {
      console.error('Speech recognition not available');
      if (onError) onError('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return false;
    }

    // Clear any previous spoken text
    this.lastSpokenText = '';

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (onError) onError(error.message);
      return false;
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Speak text using text-to-speech
  speak(text, onStart, onEnd, onError) {
    if (!this.synthesis) {
      console.error('Speech synthesis not available');
      if (onError) onError('Speech synthesis not supported');
      return false;
    }

    if (this.isSpeaking) {
      this.synthesis.cancel(); // Stop current speech
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.lastSpokenText = text;
        console.log('Speaking:', text);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        console.log('Finished speaking');
        // Clear the spoken text after a delay
        setTimeout(() => {
          this.lastSpokenText = '';
        }, 2000);
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Speech synthesis error:', event.error);
        if (onError) onError(event.error);
      };

      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      if (onError) onError(error.message);
      return false;
    }
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Check if voice features are supported
  isSupported() {
    return !!(this.recognition && this.synthesis);
  }

  // Get current status
  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isSupported: this.isSupported()
    };
  }

  // Voice commands for banking
  processBankingCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    
    // Login commands
    if (lowerTranscript.includes('login') || lowerTranscript.includes('sign in')) {
      return { action: 'navigate', target: 'login' };
    }
    
    if (lowerTranscript.includes('sign up') || lowerTranscript.includes('register')) {
      return { action: 'navigate', target: 'signup' };
    }
    
    // Form filling commands
    if (lowerTranscript.includes('email') || lowerTranscript.includes('e-mail')) {
      return { action: 'fill', field: 'email', value: this.extractEmail(transcript) };
    }
    
    if (lowerTranscript.includes('password')) {
      return { action: 'fill', field: 'password', value: this.extractPassword(transcript) };
    }
    
    if (lowerTranscript.includes('name') || lowerTranscript.includes('full name')) {
      return { action: 'fill', field: 'name', value: this.extractName(transcript) };
    }
    
    // Navigation commands
    if (lowerTranscript.includes('dashboard') || lowerTranscript.includes('home')) {
      return { action: 'navigate', target: 'dashboard' };
    }
    
    if (lowerTranscript.includes('logout') || lowerTranscript.includes('sign out')) {
      return { action: 'logout' };
    }
    
    // Chatbot commands
    if (
      lowerTranscript.includes('chat') ||
      lowerTranscript.includes('assistant') ||
      lowerTranscript.includes('help') ||
      lowerTranscript.includes('मदद') ||
      lowerTranscript.includes('सहायता') ||
      lowerTranscript.includes('हेल्प')
    ) {
      return { action: 'open_chatbot' };
    }
    
    // Submit commands
    if (lowerTranscript.includes('submit') || lowerTranscript.includes('enter') || lowerTranscript.includes('go')) {
      return { action: 'submit' };
    }
    
    // Clear commands
    if (lowerTranscript.includes('clear') || lowerTranscript.includes('reset')) {
      return { action: 'clear' };
    }
    
    // Back commands
    if (lowerTranscript.includes('back') || lowerTranscript.includes('previous')) {
      return { action: 'back' };
    }
    
    return { action: 'unknown', transcript };
  }

  // Extract email from transcript
  extractEmail(transcript) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = transcript.match(emailRegex);
    return match ? match[0] : '';
  }

  // Extract name from transcript
  extractName(transcript) {
    // Remove common words and extract potential name
    const words = transcript.toLowerCase()
      .replace(/(my name is|i am|call me|this is)/g, '')
      .trim()
      .split(' ')
      .filter(word => word.length > 2);
    
    return words.slice(0, 2).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Extract password from transcript
  extractPassword(transcript) {
    // Look for patterns like "my password is", "password is", etc.
    const passwordPatterns = [
      /my password is (.+)/i,
      /password is (.+)/i,
      /my password (.+)/i,
      /password (.+)/i
    ];
    
    for (const pattern of passwordPatterns) {
      const match = transcript.match(pattern);
      if (match && match[1]) {
        // Clean up the extracted password
        let password = match[1].trim();
        
        // Remove common words that might be picked up
        password = password.replace(/\b(is|the|my|password)\b/gi, '').trim();
        
        // Remove any remaining punctuation or extra words
        password = password.replace(/[^\w\d]/g, '');
        
        if (password.length > 0) {
          console.log('Extracted password:', password);
          return password;
        }
      }
    }
    
    // If no pattern matches, try to extract numbers/words after "password"
    const words = transcript.toLowerCase().split(' ');
    const passwordIndex = words.findIndex(word => word.includes('password'));
    
    if (passwordIndex !== -1 && passwordIndex + 1 < words.length) {
      let password = words[passwordIndex + 1];
      
      // Clean up the password
      password = password.replace(/[^\w\d]/g, '');
      
      if (password.length > 0) {
        console.log('Extracted password from words:', password);
        return password;
      }
    }
    
    console.log('No password found in transcript:', transcript);
    return '';
  }

  // Banking-specific voice prompts
  getBankingPrompts(lang = 'en') {
    const prompts = {
      en: {
        login: [
          "Say 'my email is' followed by your email address",
          "Say 'my password is' followed by your password",
          "Say 'login' to submit",
          "Say 'sign up' to create a new account"
        ],
        signup: [
          "Say 'my name is' followed by your full name",
          "Say 'my email is' followed by your email address",
          "Say 'my password is' followed by your password",
          "Say 'submit' to create account"
        ],
        'forgot-password': [
          "Say 'my email is' followed by your email address",
          "Say 'submit' to send reset link",
          "Say 'back' to return to login",
          "Say 'clear' to clear the form"
        ],
        dashboard: [
          "Say 'open chat' to talk to the assistant",
          "Say 'logout' to sign out",
          "Say 'help' for voice commands"
        ],
        chatbot: [
          "Ask me about your account balance",
          "Say 'transfer money' for transfer options",
          "Say 'investment options' for investment help",
          "Say 'card services' for card management"
        ]
      },
      hi: {
        login: [
          "'मेरा ईमेल है' कहें और फिर अपना ईमेल पता बोलें",
          "'मेरा पासवर्ड है' कहें और फिर अपना पासवर्ड बोलें",
          "'लॉगिन' कहें फॉर्म सबमिट करने के लिए",
          "'पंजीकरण करे' कहें नया खाता बनाने के लिए"
        ],
        signup: [
          "'मेरा नाम है' कहें और फिर अपना पूरा नाम बोलें",
          "'मेरा ईमेल है' कहें और फिर अपना ईमेल पता बोलें",
          "'मेरा पासवर्ड है' कहें और फिर अपना पासवर्ड बोलें",
          "'सबमिट' कहें खाता बनाने के लिए"
        ],
        'forgot-password': [
          "'मेरा ईमेल है' कहें और फिर अपना ईमेल पता बोलें",
          "'सबमिट' कहें रीसेट लिंक भेजने के लिए",
          "'वापस' कहें लॉगिन पर लौटने के लिए",
          "'साफ़ करें' कहें फॉर्म साफ़ करने के लिए"
        ],
        dashboard: [
          "'ओपन चैट' कहें सहायक से बात करने के लिए",
          "'लॉगआउट' कहें साइन आउट करने के लिए",
          "'हेल्प' कहें वॉइस कमांड्स के लिए"
        ],
        chatbot: [
          "मुझसे अपने खाते की शेष राशि पूछें",
          "'पैसे ट्रांसफर करें' कहें ट्रांसफर विकल्पों के लिए",
          "'निवेश विकल्प' कहें निवेश सहायता के लिए",
          "'कार्ड सेवाएँ' कहें कार्ड प्रबंधन के लिए"
        ]
      },
      mr: {
        login: [
          "'माझा ईमेल आहे' म्हणा आणि नंतर तुमचा ईमेल पत्ता बोला",
          "'माझा पासवर्ड आहे' म्हणा आणि नंतर तुमचा पासवर्ड बोला",
          "'लॉगिन' म्हणा फॉर्म सबमिट करण्यासाठी",
          "'साइन अप' म्हणा नवीन खाते तयार करण्यासाठी"
        ],
        signup: [
          "'माझं नाव आहे' म्हणा आणि नंतर तुमचं पूर्ण नाव बोला",
          "'माझा ईमेल आहे' म्हणा आणि नंतर तुमचा ईमेल पत्ता बोला",
          "'माझा पासवर्ड आहे' म्हणा आणि नंतर तुमचा पासवर्ड बोला",
          "'सबमिट' म्हणा खाते तयार करण्यासाठी"
        ],
        'forgot-password': [
          "'माझा ईमेल आहे' म्हणा आणि नंतर तुमचा ईमेल पत्ता बोला",
          "'सबमिट' म्हणा रीसेट लिंक पाठवण्यासाठी",
          "'बॅक' म्हणा लॉगिनवर परत जाण्यासाठी",
          "'क्लिअर' म्हणा फॉर्म क्लिअर करण्यासाठी"
        ],
        dashboard: [
          "'ओपन चॅट' म्हणा सहाय्यकाशी बोलण्यासाठी",
          "'लॉगआउट' म्हणा साइन आउट करण्यासाठी",
          "'हेल्प' म्हणा व्हॉइस कमांडसाठी"
        ],
        chatbot: [
          "माझ्या खात्याच्या शिल्लक रकमेबद्दल विचारा",
          "'पैसे ट्रान्सफर करा' म्हणा ट्रान्सफर पर्यायांसाठी",
          "'गुंतवणूक पर्याय' म्हणा गुंतवणूक सहाय्यासाठी",
          "'कार्ड सेवा' म्हणा कार्ड व्यवस्थापनासाठी"
        ]
      }
    };
    return prompts[lang] || prompts.en;
  }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService; 