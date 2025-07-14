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
    
    this.initSpeechRecognition();
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
        this.recognition.lang = 'en-US';
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
      utterance.lang = 'en-US';
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
    if (lowerTranscript.includes('chat') || lowerTranscript.includes('assistant') || lowerTranscript.includes('help')) {
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
  getBankingPrompts() {
    return {
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
    };
  }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService; 