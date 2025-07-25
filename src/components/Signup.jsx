import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { useLanguage } from '../contexts/LanguageContext';

function Signup() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const translations = {
    en: {
      createAccount: 'Create Account',
      joinToday: 'Join ArthSetu today',
      fullName: 'Full Name',
      fullNamePlaceholder: "Enter your full name or say 'my name is' followed by your name",
      email: 'Email Address',
      emailPlaceholder: "Enter your email or say 'my email is' followed by your email",
      password: 'Password',
      passwordPlaceholder: "Enter your password or say 'my password is' followed by your password",
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign In',
      creatingAccount: 'Creating Account...',
      createAccountBtn: 'Create Account',
      ssl: '256-bit SSL Encryption',
      voice: 'Voice commands available - Click the microphone button',
      passwordsNoMatch: 'Passwords do not match',
      passwordShort: 'Password must be at least 6 characters',
      failedCreate: 'Failed to create an account: ',
      formCleared: 'Form cleared',
      nameSet: 'Name set to: ',
      emailSet: 'Email set to: ',
      passwordSet: 'Password entered and confirmed',
      submitting: 'Creating account...',
      navigatingLogin: 'Navigating to login page...',
      processing: 'Processing: ',
      heard: 'I heard: ',
      tryDifferent: 'Please try a different command.',
      brand: 'ArthSetu',
      digitalBanking: 'Digital Banking Solutions',
    },
    hi: {
      createAccount: 'खाता बनाएं',
      joinToday: 'आज ही ArthSetu से जुड़ें',
      fullName: 'पूरा नाम',
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें या 'मेरा नाम है' बोलें और नाम बताएं",
      email: 'ईमेल पता',
      emailPlaceholder: "अपना ईमेल दर्ज करें या 'मेरा ईमेल है' बोलें और ईमेल बताएं",
      password: 'पासवर्ड',
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें या 'मेरा पासवर्ड है' बोलें और पासवर्ड बताएं",
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      confirmPasswordPlaceholder: 'पासवर्ड की पुष्टि करें',
      alreadyHaveAccount: 'पहले से खाता है?',
      signIn: 'साइन इन करें',
      creatingAccount: 'खाता बना रहे हैं...',
      createAccountBtn: 'खाता बनाएं',
      ssl: '256-बिट SSL एन्क्रिप्शन',
      voice: 'वॉयस कमांड उपलब्ध - माइक्रोफोन बटन पर क्लिक करें',
      passwordsNoMatch: 'पासवर्ड मेल नहीं खाते',
      passwordShort: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
      failedCreate: 'खाता बनाने में विफल: ',
      formCleared: 'फॉर्म साफ़ किया गया',
      nameSet: 'नाम सेट किया गया: ',
      emailSet: 'ईमेल सेट किया गया: ',
      passwordSet: 'पासवर्ड दर्ज और पुष्टि की गई',
      submitting: 'खाता बना रहे हैं...',
      navigatingLogin: 'लॉगिन पेज पर जा रहे हैं...',
      processing: 'प्रोसेस कर रहे हैं: ',
      heard: 'मैंने सुना: ',
      tryDifferent: 'कृपया कोई अन्य कमांड आज़माएं।',
      brand: 'अर्थसेतू',
      digitalBanking: 'डिजिटल बैंकिंग समाधान',
    },
    mr: {
      createAccount: 'खाते तयार करा',
      joinToday: 'आजच ArthSetu मध्ये सामील व्हा',
      fullName: 'पूर्ण नाव',
      fullNamePlaceholder: "आपले पूर्ण नाव प्रविष्ट करा किंवा 'माझे नाव आहे' असे बोला आणि नाव सांगा",
      email: 'ईमेल पत्ता',
      emailPlaceholder: "आपला ईमेल प्रविष्ट करा किंवा 'माझा ईमेल आहे' असे बोला आणि ईमेल सांगा",
      password: 'पासवर्ड',
      passwordPlaceholder: "आपला पासवर्ड प्रविष्ट करा किंवा 'माझा पासवर्ड आहे' असे बोला आणि पासवर्ड सांगा",
      confirmPassword: 'पासवर्डची पुष्टी करा',
      confirmPasswordPlaceholder: 'पासवर्डची पुष्टी करा',
      alreadyHaveAccount: 'आधीच खाते आहे?',
      signIn: 'साइन इन करा',
      creatingAccount: 'खाते तयार करत आहे...',
      createAccountBtn: 'खाते तयार करा',
      ssl: '256-बिट SSL एनक्रिप्शन',
      voice: 'व्हॉइस कमांड उपलब्ध - मायक्रोफोन बटणावर क्लिक करा',
      passwordsNoMatch: 'पासवर्ड जुळत नाहीत',
      passwordShort: 'पासवर्ड किमान 6 अक्षरांचा असावा',
      failedCreate: 'खाते तयार करण्यात अयशस्वी: ',
      formCleared: 'फॉर्म साफ केला',
      nameSet: 'नाव सेट केले: ',
      emailSet: 'ईमेल सेट केला: ',
      passwordSet: 'पासवर्ड प्रविष्ट आणि पुष्टी केला',
      submitting: 'खाते तयार करत आहे...',
      navigatingLogin: 'लॉगिन पेजवर जात आहे...',
      processing: 'प्रक्रिया करत आहे: ',
      heard: 'मी ऐकले: ',
      tryDifferent: 'कृपया वेगळा कमांड वापरा.',
      brand: 'अर्थसेतू',
      digitalBanking: 'डिजिटल बँकिंग सोल्यूशन्स',
    }
  };
  const t = translations[language] || translations.en;

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError(t.passwordsNoMatch);
    }

    if (password.length < 6) {
      return setError(t.passwordShort);
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName);
      navigate('/dashboard');
    } catch (error) {
      setError(t.failedCreate + error.message);
    }
    setLoading(false);
  }

  // Handle voice commands
  const handleVoiceCommand = (command, transcript) => {
    console.log('Voice command received:', command);
    
    switch (command.action) {
      case 'fill':
        if (command.field === 'name') {
          setDisplayName(command.value);
          setVoiceFeedback(t.nameSet + command.value);
        } else if (command.field === 'email') {
          setEmail(command.value);
          setVoiceFeedback(t.emailSet + command.value);
        } else if (command.field === 'password') {
          setPassword(command.value);
          setConfirmPassword(command.value);
          setVoiceFeedback(t.passwordSet);
        }
        break;
      
      case 'submit':
        handleSubmit(new Event('submit'));
        setVoiceFeedback(t.submitting);
        break;
      
      case 'navigate':
        if (command.target === 'login') {
          navigate('/login');
          setVoiceFeedback(t.navigatingLogin);
        }
        break;
      
      case 'clear':
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setVoiceFeedback(t.formCleared);
        break;
      
      case 'unknown':
        setVoiceFeedback(t.heard + transcript + t.tryDifferent);
        break;
      
      default:
        setVoiceFeedback(t.processing + transcript);
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => setVoiceFeedback(''), 3000);
  };

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

                <h2 className="text-center mb-4 fw-bold text-dark">{t.createAccount}</h2>
                <p className="text-center text-muted mb-4">{t.joinToday}</p>

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

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="displayName" className="form-label fw-semibold text-dark">
                      <i className="fas fa-user me-2 text-primary"></i>
                      {t.fullName}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-user text-muted"></i>
                      </span>
                      <input 
                        type="text" 
                        id="displayName" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="form-control border-start-0" 
                        placeholder={t.fullNamePlaceholder}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
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
                        placeholder={t.emailPlaceholder}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      {t.password}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-key text-muted"></i>
                      </span>
                      <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control border-start-0" 
                        placeholder={t.passwordPlaceholder}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      {t.confirmPassword}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-key text-muted"></i>
                      </span>
                      <input 
                        type="password" 
                        id="confirmPassword" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-control border-start-0" 
                        placeholder={t.confirmPasswordPlaceholder}
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
                        {t.creatingAccount}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        {t.createAccountBtn}
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-muted mb-0">{t.alreadyHaveAccount}</p>
                    <a href="/login" className="text-primary text-decoration-none fw-semibold">
                      {t.signIn}
                    </a>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="text-center mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <i className="fas fa-shield-alt text-success security-icon"></i>
                    <small className="text-muted">{t.ssl}</small>
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
        currentPage="signup"
      />
    </div>
  );
}

export default Signup; 