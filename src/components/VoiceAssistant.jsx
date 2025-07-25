import React, { useState, useEffect, useRef } from 'react';
import voiceService from '../services/voiceService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useLanguage } from '../contexts/LanguageContext';

const VoiceAssistant = ({ onVoiceCommand, currentPage = 'login' }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const timeoutRef = useRef(null);
  const listenTimeoutRef = useRef(null);

  useEffect(() => {
    // Set language for voiceService
    voiceService.setLanguage(language);
    setVoiceSupported(voiceService.isSupported());
    
    // Welcome message for new users
    if (voiceSupported && currentPage === 'login') {
      setTimeout(() => {
        speak(getPrompt('welcome'));
      }, 1000);
    }
  }, [currentPage, voiceSupported, language]);

  const translations = {
    en: {
      welcome: "Welcome to ArthSetu. You can use voice commands to navigate and fill forms. Say 'help' for voice commands.",
      sorry: "Sorry, I could not understand. Please try again.",
      listening: "Listening...",
      processing: "Processing: ",
      unknown: (result) => `I heard: ${result}. Please try a different command.`,
      help: 'Help',
      commands: 'Voice Commands',
      available: 'Available Commands',
      tip: 'Tip',
      tipText: "You can say 'help' at any time to see these commands.",
    },
    hi: {
      welcome: "DigiBank में आपका स्वागत है। आप वॉइस कमांड का उपयोग कर सकते हैं। वॉइस कमांड के लिए 'help' कहें।",
      sorry: "माफ़ कीजिए, मैं समझ नहीं पाया। कृपया पुनः प्रयास करें।",
      listening: "सुन रहा हूँ...",
      processing: "प्रसंस्करण: ",
      unknown: (result) => `मैंने सुना: ${result}. कृपया कोई अन्य कमांड आज़माएँ।`,
      help: 'मदद',
      commands: 'वॉइस कमांड्स',
      available: 'उपलब्ध कमांड्स',
      tip: 'टिप',
      tipText: "इन कमांड्स को देखने के लिए कभी भी 'हेल्प' कहें।",
    },
    mr: {
      welcome: "DigiBank मध्ये आपले स्वागत आहे. आपण व्हॉइस कमांड वापरू शकता. व्हॉइस कमांडसाठी 'help' म्हणा.",
      sorry: "माफ करा, मी समजू शकलो नाही. कृपया पुन्हा प्रयत्न करा.",
      listening: "ऐकत आहे...",
      processing: "प्रक्रिया: ",
      unknown: (result) => `मी ऐकले: ${result}. कृपया दुसरी कमांड वापरा.`,
      help: 'मदत',
      commands: 'व्हॉइस कमांड्स',
      available: 'उपलब्ध कमांड्स',
      tip: 'टीप',
      tipText: "ही कमांड्स पाहण्यासाठी कधीही 'हेल्प' म्हणा.",
    }
  };
  const t = translations[language] || translations.en;

  const speak = (text) => {
    voiceService.speak(
      text,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        // Add delay before allowing new listening session
        setTimeout(() => {
          // Clear any pending timeouts
          if (listenTimeoutRef.current) {
            clearTimeout(listenTimeoutRef.current);
          }
        }, 1000);
      },
      (error) => console.error('Speech error:', error)
    );
  };

  const getPrompt = (type, result) => {
    if (type === 'welcome') return t.welcome;
    if (type === 'sorry') return t.sorry;
    if (type === 'listening') return t.listening;
    if (type === 'processing') return t.processing;
    if (type === 'unknown') return t.unknown(result);
    return '';
  };

  const startListening = () => {
    if (!voiceSupported) {
      alert('Voice features are not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    // Don't start listening if we're still speaking
    if (isSpeaking) {
      console.log('Still speaking, wait before listening');
      return;
    }

    const success = voiceService.startListening(
      (result) => {
        console.log('Voice input received:', result);
        setTranscript(result);
        setIsListening(false);

        // --- Handle 'help' command locally ---
        const lowerResult = result.toLowerCase();
        if (
          lowerResult.includes('help') ||
          lowerResult.includes('मदद') ||
          lowerResult.includes('सहायता') ||
          lowerResult.includes('हेल्प')
        ) {
          setShowPrompts(true);
          speak(t.help);
          return;
        }
        // --- End local help handling ---

        // Process the voice command
        const command = voiceService.processBankingCommand(result);
        setLastCommand(command);

        if (onVoiceCommand) {
          onVoiceCommand(command, result);
        }

        // Provide feedback with delay
        setTimeout(() => {
          if (command.action === 'unknown') {
            speak(getPrompt('unknown', result));
          } else {
            speak(getPrompt('processing') + result);
          }
        }, 500);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
        setTimeout(() => {
          speak(getPrompt('sorry'));
        }, 500);
      },
      () => {
        setIsListening(true);
        // Don't speak "Listening..." immediately, let the UI show it
        console.log('Started listening');
      },
      () => {
        setIsListening(false);
      }
    );

    if (!success) {
      speak('Voice recognition is not available. Please check your microphone permissions.');
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const togglePrompts = () => {
    setShowPrompts(!showPrompts);
  };

  const getPromptsForPage = () => {
    const prompts = voiceService.getBankingPrompts(language);
    // Fallback to login prompts if currentPage is not found or empty
    return (prompts[currentPage] && prompts[currentPage].length > 0) ? prompts[currentPage] : prompts.login;
  };

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      // Add a small delay before starting to listen
      setTimeout(() => {
        startListening();
      }, 300);
    }
  };

  // Auto-stop listening after 20 seconds
  useEffect(() => {
    if (isListening) {
      timeoutRef.current = setTimeout(() => {
        stopListening();
        speak('Voice recognition timed out. Please try again.');
      }, 20000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening]);

  if (!voiceSupported) {
    return null; // Don't show voice assistant if not supported
  }

  return (
    <>
      {/* Voice Assistant Button */}
      <div className="position-fixed top-0 end-0 m-4" style={{ zIndex: 1001 }}>
        <div className="d-flex flex-column align-items-end" style={{ paddingTop: '60%' }}>
          {/* Voice Button */}
          <button
            className={`btn btn-lg rounded-circle shadow-lg voice-assistant-btn ${
              isListening ? 'btn-danger' : 'btn-primary'
            }`}
            onClick={handleVoiceButtonClick}
            disabled={isSpeaking}
            style={{ 
              width: '70px', 
              height: '70px',
              transition: 'all 0.3s ease',
              opacity: isSpeaking ? 0.6 : 1
            }}
            title={isListening ? 'Stop Listening' : isSpeaking ? 'Speaking...' : 'Start Voice Assistant'}
          >
            <i className={`fas fa-${isListening ? 'stop' : isSpeaking ? 'volume-up' : 'microphone'} fs-4`}></i>
          </button>

          {/* Help Button */}
          <button
            className="btn btn-outline-primary mt-2 voice-help-btn"
            onClick={togglePrompts}
            style={{ 
              fontSize: '0.9rem',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '2px solid #007bff',
              backgroundColor: 'rgba(255,255,255,0.95)',
              transition: 'all 0.3s ease'
            }}
            title="Voice Commands Help"
          >
            <i className="fas fa-question-circle me-2"></i>
            {t.help}
          </button>
        </div>
      </div>

      {/* Voice Prompts Modal */}
      {showPrompts && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ zIndex: 1002, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="card shadow-lg" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-microphone me-2"></i>
                {t.commands}
              </h5>
              <button 
                className="btn btn-link text-white p-0"
                onClick={togglePrompts}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body">
              <h6 className="text-primary mb-3">{t.available}</h6>
              <ul className="list-unstyled">
                {getPromptsForPage() && getPromptsForPage().length > 0 ? (
                  getPromptsForPage().map((prompt, index) => (
                    <li key={index} className="mb-2">
                      <i className="fas fa-arrow-right text-primary me-2"></i>
                      {prompt}
                    </li>
                  ))
                ) : (
                  <li className="text-muted">No voice commands available for this page.</li>
                )}
              </ul>
              
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  <strong>{t.tip}:</strong> {t.tipText}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Status Indicator */}
      {isListening && (
        <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1003 }}>
          <div className="card shadow-lg border-0">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="voice-pulse-animation">
                  <i className="fas fa-microphone text-danger fs-1"></i>
                </div>
              </div>
              <h5 className="text-danger mb-2">Listening...</h5>
              <p className="text-muted mb-0">Speak your command now</p>
            </div>
          </div>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1004 }}>
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <i className="fas fa-volume-up me-2"></i>
            Speaking...
          </div>
        </div>
      )}

      {/* Last Command Display */}
      {lastCommand && lastCommand.action !== 'unknown' && (
        <div className="position-fixed bottom-0 start-0 m-3" style={{ zIndex: 1000 }}>
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            <strong>Command:</strong> {lastCommand.action}
            <button type="button" className="btn-close" onClick={() => setLastCommand('')}></button>
          </div>
        </div>
      )}

      {/* Custom CSS for voice animations */}
      <style jsx>{`
        .voice-pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .voice-assistant-btn:hover {
          transform: scale(1.1);
        }
        
        .voice-assistant-btn:active {
          transform: scale(0.95);
        }
        
        .voice-help-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
          background-color: #007bff !important;
          color: white !important;
        }
        
        .voice-help-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
};

export default VoiceAssistant; 