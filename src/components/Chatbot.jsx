import React, { useState, useRef, useEffect } from 'react';
import { getFreeAIResponse, isFreeAIAvailable } from '../services/freeAIService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { useLanguage } from '../contexts/LanguageContext';

function Chatbot({ isOpen: externalIsOpen, onToggle }) {
  const { language } = useLanguage();

  const translations = {
    en: {
      greeting: "Hello! I'm DigiBank Assistant. How can I help you today?",
      error: "I'm having trouble processing your request right now. Please try again or contact our support team.",
      typing: "Assistant is typing...",
      placeholder: "Type your message..."
    },
    hi: {
      greeting: "नमस्ते! मैं DigiBank सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
      error: "मैं अभी आपकी अनुरोध को संसाधित करने में असमर्थ हूँ। कृपया पुनः प्रयास करें या हमारी सहायता टीम से संपर्क करें।",
      typing: "सहायक टाइप कर रहा है...",
      placeholder: "अपना संदेश लिखें..."
    },
    mr: {
      greeting: "नमस्कार! मी DigiBank सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?",
      error: "मी सध्या तुमच्या विनंतीवर प्रक्रिया करण्यात अक्षम आहे. कृपया पुन्हा प्रयत्न करा किंवा आमच्या सहाय्यक टीमशी संपर्क साधा.",
      typing: "सहाय्यक टाइप करत आहे...",
      placeholder: "आपला संदेश लिहा..."
    }
  };

  const t = translations[language] || translations.en;

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t.greeting,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAIAvailableState, setIsAIAvailableState] = useState(false);
  const messagesEndRef = useRef(null);

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

  // Enhanced bot response with free AI integration
  const getBotResponse = async (message) => {
    try {
      console.log('Getting bot response for:', message);
      
      // Get free AI or fallback response
      const response = await getFreeAIResponse(message, messages.slice(-6));
      console.log('Bot response received:', response);
      
      return response;
    } catch (error) {
      console.error('Error in getBotResponse:', error);
      
      // Return a friendly error message
      return {
        text: t.error,
        quickReplies: ['Try Again', 'Contact Support', 'Help']
      };
    }
  };

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
      const botResponse = await getBotResponse(message);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: botResponse.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble processing your request right now. Please try again or contact our support team.",
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Try Again', 'Contact Support', 'Help']
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
                  <h6 className="mb-0 fw-bold">DigiBank Assistant</h6>
                  <small className="text-white-50">
                    {isAIAvailableState ? 'AI Powered (Free)' : 'Standard Mode'}
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
                      <div className="mb-1">{message.text}</div>
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
                        <small className="text-muted">{t.typing}</small>
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
                  placeholder={t.placeholder}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot; 