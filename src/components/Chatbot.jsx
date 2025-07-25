import React, { useState, useRef, useEffect } from 'react';
import { isFreeAIAvailable } from '../services/freeAIService';
import { sendMessageToVertexAI } from '../services/vertexAIChatService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { useLanguage } from '../contexts/LanguageContext';


// Helper to render bot message text with bullets/numbered points as a list
function renderChatbotText(text) {
  if (!text) return null;
  const lines = text.split('\n').filter(line => line.trim() !== '');
  // Detect if most lines are bullets or numbers
  const isBullet = lines.filter(line => /^(\s*[-*]\s+|\s*\d+\.\s+)/.test(line)).length > lines.length / 2;
  if (isBullet) {
    return (
      <ul style={{ paddingLeft: '1.2em', marginBottom: 0 }}>
        {lines.map((line, idx) => (
          <li key={idx} style={{ textAlign: 'left', marginBottom: 2 }}>
            {line.replace(/^(\s*[-*]\s+|\s*\d+\.\s+)/, '')}
          </li>
        ))}
      </ul>
    );
  }
  // Otherwise, render as paragraphs
  return lines.map((line, idx) => (
    <div key={idx} style={{ textAlign: 'left', marginBottom: 2 }}>{line}</div>
  ));
}

function Chatbot({ isOpen: externalIsOpen, onToggle }) {
  const { language } = useLanguage();
  const translations = {
    en: {
      welcome: "Hello! I'm ArthSetu (Bridge to finance) Assistant. How can I help you today?",
      aiPowered: 'AI Powered',
      standardMode: 'Standard Mode',
      assistantTyping: 'Assistant is typing...',
      typeMessage: 'Type your message...',
      typeMessageHi: 'अपना संदेश लिखें या बोलें...',
      typeMessageMr: 'तुमचा संदेश लिहा किंवा बोला..',
      error: "I'm having trouble processing your request right now. Please try again or contact our support team.",
      tryAgain: 'Try Again',
      contactSupport: 'Contact Support',
      help: 'Help',
      listening: 'Listening... Speak now!'
    },
    hi: {
      welcome: 'नमस्ते! मैं ArthSetu (Bridge to finance) सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
      aiPowered: 'एआई संचालित',
      standardMode: 'मानक मोड',
      assistantTyping: 'सहायक टाइप कर रहा है...',
      typeMessage: 'अपना संदेश लिखें या बोलें...',
      typeMessageHi: 'अपना संदेश लिखें या बोलें...',
      typeMessageMr: 'तुमचा संदेश लिहा किंवा बोला..',
      error: 'मैं अभी आपकी अनुरोध को संसाधित करने में असमर्थ हूँ। कृपया पुनः प्रयास करें या हमारी सहायता टीम से संपर्क करें।',
      tryAgain: 'पुनः प्रयास करें',
      contactSupport: 'सहायता से संपर्क करें',
      help: 'मदद',
      listening: 'सुन रहा हूँ... अभी बोलें!'
    },
    mr: {
      welcome: 'नमस्कार! मी ArthSetu (Bridge to finance) सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?',
      aiPowered: 'एआय समर्थित',
      standardMode: 'मानक मोड',
      assistantTyping: 'सहाय्यक टाइप करत आहे...',
      typeMessage: 'तुमचा संदेश लिहा किंवा बोला..',
      typeMessageHi: 'अपना संदेश लिखें या बोलें...',
      typeMessageMr: 'तुमचा संदेश लिहा किंवा बोला..',
      error: 'मी सध्या तुमच्या विनंतीवर प्रक्रिया करू शकत नाही. कृपया पुन्हा प्रयत्न करा किंवा आमच्या सहाय्यक टीमशी संपर्क साधा.',
      tryAgain: 'पुन्हा प्रयत्न करा',
      contactSupport: 'संपर्क समर्थन',
      help: 'मदत',
      listening: 'ऐकत आहे... आत्ता बोला!'
    }
  };
  const t = translations[language] || translations.en;

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t.welcome,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAIAvailableState, setIsAIAvailableState] = useState(false);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Use external state if provided, otherwise use internal state
  const isChatbotOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setIsChatbotOpen = externalIsOpen !== undefined ? onToggle : setIsOpen;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check AI availability on component mount
  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        const available = isFreeAIAvailable();
        setIsAIAvailableState(available);
        console.log('Free AI Available:', available);
      } catch (error) {
        console.error('Error checking AI availability:', error);
        setIsAIAvailableState(false);
      }
    };
    
    checkAIAvailability();
  }, []);

  // Add this effect to update the welcome message when language changes
  useEffect(() => {
    setMessages((msgs) => {
      // If the first message is a bot welcome, update it; else, prepend
      if (msgs.length > 0 && msgs[0].sender === 'bot') {
        const updated = [...msgs];
        updated[0] = { ...updated[0], text: t.welcome };
        return updated;
      } else {
        return [
          {
            id: Date.now(),
            text: t.welcome,
            sender: 'bot',
            timestamp: new Date()
          },
          ...msgs
        ];
      }
    });
  }, [language]);

  // Voice recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = () => setIsListening(false);
  }, []);


  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    console.log('Sending message:', message);

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI or fallback response
      const aiResponse = await sendMessageToVertexAI(message);
      
      const botMessage = {
        id: Date.now() + 1,
        text: typeof aiResponse === 'string' ? aiResponse : aiResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: aiResponse.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Error message
      const errorMessage = {
        id: Date.now() + 1,
        text: t.error,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [t.tryAgain, t.contactSupport, t.help]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    recognitionRef.current.start();
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1000 }}>
        <button
          className={`btn btn-primary rounded-circle shadow-lg chatbot-toggle ${isChatbotOpen ? 'd-none' : ''}`}
          style={{ width: '60px', height: '60px' }}
          onClick={() => setIsChatbotOpen(true)}
        >
          <i className="fas fa-comments fs-4"></i>
        </button>
      </div>

      {/* Chatbot Window */}
      {isChatbotOpen && (
        <div className="position-fixed bottom-0 end-0 m-4 chatbot-window" style={{ zIndex: 1000, width: '350px', maxHeight: '500px' }}>
          <div className="card shadow-lg border-0">
            {/* Chatbot Header */}
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style={{ width: '32px', height: '32px' }}>
                  <i className="fas fa-robot text-primary"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">ArthSetu (Bridge to finance) Assistant</h6>
                  <small className="text-white-50">
                    {isAIAvailableState ? t.aiPowered : t.standardMode}
                  </small>
                </div>
              </div>
              <button
                className="btn btn-link text-white p-0"
                onClick={() => setIsChatbotOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="card-body p-0" style={{ height: '400px', overflowY: 'auto' }}>
              <div className="p-3">
                {messages.map((message) => (
                  <div key={message.id} className={`mb-3 chat-message ${message.sender === 'user' ? 'text-end' : ''}`}>
                    <div className={`d-inline-block p-3 rounded-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-light text-dark'
                    }`} style={{ maxWidth: '80%' }}>
                      <div className="mb-1">{message.sender === 'bot' ? renderChatbotText(message.text) : message.text}</div>
                      <small className={`${message.sender === 'user' ? 'text-white-50' : 'text-muted'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    {/* Quick Replies */}
                    {message.sender === 'bot' && message.quickReplies && (
                      <div className="mt-2">
                        {message.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            className="btn btn-outline-primary btn-sm me-1 mb-1 quick-reply-btn"
                            onClick={() => handleQuickReply(reply)}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="mb-3 chat-message">
                    <div className="d-inline-block p-3 rounded-3 bg-light text-dark" style={{ maxWidth: '80%' }}>
                      <div className="d-flex align-items-center">
                        <div className="typing-indicator me-2">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <small className="text-muted">{t.assistantTyping}</small>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="card-footer p-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    language === 'hi'
                      ? t.typeMessageHi
                      : language === 'mr'
                        ? t.typeMessageMr
                        : t.typeMessage
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleMicClick}
                  disabled={isListening || isTyping}
                  style={{ marginRight: '0.5rem' }}
                  title="Speak your question"
                >
                  <i className={`fas fa-microphone${isListening ? ' text-danger' : ''}`}></i>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              {isListening && (
                <div className="mt-2 text-danger" style={{ fontSize: '0.95rem' }}>
                  {t.listening}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot; 