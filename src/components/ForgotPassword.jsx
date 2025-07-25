import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { useLanguage } from '../contexts/LanguageContext';

function ForgotPassword() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    }
    setLoading(false);
  }

  // Handle voice commands
  const handleVoiceCommand = (command, transcript) => {
    console.log('Voice command received:', command);
    
    switch (command.action) {
      case 'fill':
        if (command.field === 'email') {
          setEmail(command.value);
          setVoiceFeedback(`Email set to: ${command.value}`);
        }
        break;
      
      case 'submit':
        handleSubmit(new Event('submit'));
        setVoiceFeedback('Sending reset link...');
        break;
      
      case 'navigate':
        if (command.target === 'login') {
          navigate('/login');
          setVoiceFeedback('Navigating to login page...');
        }
        break;
      
      case 'clear':
        setEmail('');
        setVoiceFeedback('Form cleared');
        break;
      
      case 'back':
        navigate('/login');
        setVoiceFeedback('Going back to login...');
        break;
      
      case 'unknown':
        setVoiceFeedback(`I heard: "${transcript}". Please try a different command.`);
        break;
      
      default:
        setVoiceFeedback(`Processing: ${transcript}`);
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => setVoiceFeedback(''), 3000);
  };

  const translations = {
    en: {
      reset: 'Reset Password',
      instruction: 'Enter your email to receive reset instructions',
      email: 'Email address',
      emailPlaceholder: 'Enter your email address',
      submit: 'Send Reset Link',
      security: '256-bit SSL Encryption',
      voice: 'Voice commands available - Click the microphone button',
      back: 'Back to Login',
      brand: 'ArthSetu',
      digitalBanking: 'Digital Banking Solutions',
    },
    hi: {
      reset: 'पासवर्ड रीसेट करें',
      instruction: 'रीसेट निर्देश प्राप्त करने के लिए अपना ईमेल दर्ज करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'अपना ईमेल पता दर्ज करें',
      submit: 'रीसेट लिंक भेजें',
      security: '256-बिट SSL एन्क्रिप्शन',
      voice: 'वॉइस कमांड उपलब्ध हैं - माइक्रोफोन बटन पर क्लिक करें',
      back: 'लॉगिन पर वापस जाएँ',
      brand: 'अर्थसेतू',
      digitalBanking: 'डिजिटल बैंकिंग समाधान',
    },
    mr: {
      reset: 'पासवर्ड रीसेट करा',
      instruction: 'रीसेट सूचना मिळवण्यासाठी आपला ईमेल प्रविष्ट करा',
      email: 'ईमेल पत्ता',
      emailPlaceholder: 'आपला ईमेल पत्ता प्रविष्ट करा',
      submit: 'रीसेट लिंक पाठवा',
      security: '256-बिट SSL एनक्रिप्शन',
      voice: 'व्हॉइस कमांड उपलब्ध आहेत - मायक्रोफोन बटणावर क्लिक करा',
      back: 'लॉगिनवर परत जा',
      brand: 'अर्थसेतू',
      digitalBanking: 'डिजिटल बँकिंग सोल्यूशन्स',
    }
  };
  const t = translations[language] || translations.en;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary" 
         style={{fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Bank Logo Section */}
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 bank-logo" 
                         style={{width: '60px', height: '60px'}}>
                      <i className="fas fa-university text-white fs-4"></i>
                    </div>
                    <div>
                      <h3 className="mb-0 text-primary fw-bold">{t.brand}</h3>
                      <small className="text-muted">{t.digitalBanking}</small>
                    </div>
                  </div>
                </div>

                <h2 className="text-center mb-4 fw-bold text-dark">{t.reset}</h2>
                <p className="text-center text-muted mb-4">{t.instruction}</p>

                {/* Voice Feedback Alert */}
                {voiceFeedback && (
                  <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <i className="fas fa-microphone me-2"></i>
                    {voiceFeedback}
                    <button type="button" className="btn-close" onClick={() => setVoiceFeedback('')}></button>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {message && (
                  <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      {t.email}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-envelope text-muted"></i>
                      </span>
                      <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control border-start-0" 
                        placeholder={t.email + " or say 'my " + t.email + " is' followed by your " + t.email}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 fw-bold mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        {t.submit}
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <a href="/login" className="text-primary text-decoration-none fw-semibold">
                      <i className="fas fa-arrow-left me-2"></i>
                      {t.back}
                    </a>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="text-center mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <i className="fas fa-shield-alt text-success security-icon"></i>
                    <small className="text-muted">{t.security}</small>
                  </div>
                </div>

                {/* Voice Assistant Info */}
                <div className="text-center mt-3">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <i className="fas fa-microphone text-primary"></i>
                    <small className="text-muted">{t.voice}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Assistant Component */}
      <VoiceAssistant 
        onVoiceCommand={handleVoiceCommand}
        currentPage="forgot-password"
      />
    </div>
  );
}

export default ForgotPassword; 