import React, { useState, useRef, useEffect } from 'react';
import { getFreeAIResponse, isFreeAIAvailable } from '../services/freeAIService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { navbarLanguage } from './Navbar';

// Helper to parse message text for **bold** and *italic* using CSS classes
function parseChatbotMessage(text) {
  // Replace **text** with <span class="chatbot-bold">text</span>
  // Replace *text* with <span class="chatbot-italic">text</span>
  let parsed = [];
  let regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parsed.push(text.slice(lastIndex, match.index));
    }
    const matchText = match[0];
    if (matchText.startsWith('**') && matchText.endsWith('**')) {
      parsed.push(
        <span className="chatbot-bold" key={key++}>{matchText.slice(2, -2)}</span>
      );
    } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
      parsed.push(
        <span className="chatbot-italic" key={key++}>{matchText.slice(1, -1)}</span>
      );
    } else {
      parsed.push(matchText);
    }
    lastIndex = match.index + matchText.length;
  }
  if (lastIndex < text.length) {
    parsed.push(text.slice(lastIndex));
  }
  return parsed;
}

function Chatbot({ isOpen: externalIsOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm ArthSetu(Bridge for Finance) Assistant. How can I help you today?",
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
        text: "I'm having trouble processing your request right now. Please try again or contact our support team.",
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
                  <h6 className="mb-0 fw-bold">ArthSetu(Bridge for Finance) Assistant</h6>
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
                        <small className="text-muted">Assistant is typing...</small>
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
                    navbarLanguage === 'hi'
                      ? 'अपना संदेश लिखें या बोलें...'
                      : navbarLanguage === 'mr'
                        ? 'तुमचा संदेश लिहा किंवा बोला..'
                        : 'Type your message...'
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
                  Listening... Speak now!
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