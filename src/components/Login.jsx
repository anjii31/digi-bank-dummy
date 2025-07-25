import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';

function Login() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const translations = {
    en: {
      welcomeBack: 'Welcome Back',
      signInTo: 'Sign in to your {brand} (Bridge to finance) account',
      email: 'Email Address',
      emailPlaceholder: "Enter your email or say 'my email is' followed by your email",
      password: 'Password',
      passwordPlaceholder: "Enter your password or say 'my password is' followed by your password",
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      signingIn: 'Signing In...',
      signIn: 'Sign In',
      dontHaveAccount: "Don't have an account?",
      createAccount: 'Create Account',
      ssl: '256-bit SSL Encryption',
      voice: 'Voice commands available - Click the microphone button',
      failedSignIn: 'Failed to sign in: ',
      formCleared: 'Form cleared',
      emailSet: 'Email set to: ',
      passwordSet: 'Password entered',
      submitting: 'Submitting login form...',
      navigatingSignup: 'Navigating to sign up page...',
      processing: 'Processing: ',
      heard: 'I heard: ',
      tryDifferent: 'Please try a different command.',
      brand: 'ArthSetu',
      digitalBanking: 'Digital Banking Solutions',
    },
    hi: {
      welcomeBack: 'वापसी पर स्वागत है',
      signInTo: 'अपने अर्थसेतू (Bridge to finance) खाते में साइन इन करें',
      email: 'ईमेल पता',
      emailPlaceholder: "अपना ईमेल दर्ज करें या 'मेरा ईमेल है' बोलें और ईमेल बताएं",
      password: 'पासवर्ड',
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें या 'मेरा पासवर्ड है' बोलें और पासवर्ड बताएं",
      rememberMe: 'मुझे याद रखें',
      forgotPassword: 'पासवर्ड भूल गए?',
      signingIn: 'साइन इन कर रहे हैं...',
      signIn: 'साइन इन करें',
      dontHaveAccount: 'खाता नहीं है?',
      createAccount: 'खाता बनाएं',
      ssl: '256-बिट SSL एन्क्रिप्शन',
      voice: 'वॉयस कमांड उपलब्ध - माइक्रोफोन बटन पर क्लिक करें',
      failedSignIn: 'साइन इन विफल: ',
      formCleared: 'फॉर्म साफ़ किया गया',
      emailSet: 'ईमेल सेट किया गया: ',
      passwordSet: 'पासवर्ड दर्ज किया गया',
      submitting: 'लॉगिन फॉर्म सबमिट कर रहे हैं...',
      navigatingSignup: 'साइन अप पेज पर जा रहे हैं...',
      processing: 'प्रोसेस कर रहे हैं: ',
      heard: 'मैंने सुना: ',
      tryDifferent: 'कृपया कोई अन्य कमांड आज़माएं।',
      brand: 'अर्थसेतू',
      digitalBanking: 'डिजिटल बैंकिंग समाधान',
    },
    mr: {
      welcomeBack: 'परत स्वागत आहे',
      signInTo: 'आपल्या {brand} (Bridge to finance) खात्यात साइन इन करा',
      email: 'ईमेल पत्ता',
      emailPlaceholder: "आपला ईमेल प्रविष्ट करा किंवा 'माझा ईमेल आहे' असे बोला आणि ईमेल सांगा",
      password: 'पासवर्ड',
      passwordPlaceholder: "आपला पासवर्ड प्रविष्ट करा किंवा 'माझा पासवर्ड आहे' असे बोला आणि पासवर्ड सांगा",
      rememberMe: 'मला लक्षात ठेवा',
      forgotPassword: 'पासवर्ड विसरलात?',
      signingIn: 'साइन इन करत आहे...',
      signIn: 'साइन इन करा',
      dontHaveAccount: 'खाते नाही?',
      createAccount: 'खाते तयार करा',
      ssl: '256-बिट SSL एनक्रिप्शन',
      voice: 'व्हॉइस कमांड उपलब्ध - मायक्रोफोन बटणावर क्लिक करा',
      failedSignIn: 'साइन इन अयशस्वी: ',
      formCleared: 'फॉर्म साफ केला',
      emailSet: 'ईमेल सेट केला: ',
      passwordSet: 'पासवर्ड प्रविष्ट केला',
      submitting: 'लॉगिन फॉर्म सबमिट करत आहे...',
      navigatingSignup: 'साइन अप पेजवर जात आहे...',
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

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      setError(t.failedSignIn + error.message);
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
          setVoiceFeedback(t.emailSet + command.value);
        } else if (command.field === 'password') {
          setPassword(command.value);
          setVoiceFeedback(t.passwordSet);
        }
        break;
      
      case 'submit':
        handleSubmit(new Event('submit'));
        setVoiceFeedback(t.submitting);
        break;
      
      case 'navigate':
        if (command.target === 'signup') {
          navigate('/signup');
          setVoiceFeedback(t.navigatingSignup);
        }
        break;
      
      case 'clear':
        setEmail('');
        setPassword('');
        setVoiceFeedback(t.formCleared);
        break;
      
      case 'unknown':
        setVoiceFeedback(t.heard + `"${transcript}". ` + t.tryDifferent);
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
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center security-icon" 
                         style={{width: '40px', height: '40px'}}>
                      <i className="fas fa-shield-alt text-white"></i>
                    </div>
                    <div className="bg-info rounded-circle d-flex align-items-center justify-content-center security-icon" 
                         style={{width: '40px', height: '40px'}}>
                      <i className="fas fa-lock text-white"></i>
                    </div>
                    <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center security-icon" 
                         style={{width: '40px', height: '40px'}}>
                      <i className="fas fa-credit-card text-white"></i>
                    </div>
                  </div>
                </div>

                <h2 className="text-center mb-4 fw-bold text-dark">{t.welcomeBack}</h2>
                <p className="text-center text-muted mb-4">{t.signInTo.replace('{brand}', t.brand)}</p>

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
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      {t.email}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-user text-muted"></i>
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
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      {t.password}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-key text-muted"></i>
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control border-start-0" 
                        placeholder={t.passwordPlaceholder}
                        required
                      />
                      <button 
                        className="btn btn-outline-secondary border-start-0" 
                        type="button"
                        style={{borderLeft: 'none'}}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="remember" />
                      <label className="form-check-label text-muted" htmlFor="remember">
                        {t.rememberMe}
                      </label>
                    </div>
                    <a href="/forgot-password" className="text-primary text-decoration-none fw-semibold">
                      {t.forgotPassword}
                    </a>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 fw-bold mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t.signingIn}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        {t.signIn}
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-muted mb-0">{t.dontHaveAccount}</p>
                    <a href="/signup" className="text-primary text-decoration-none fw-semibold">
                      {t.createAccount}
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
        currentPage="login"
      />
    
    </div>
  );
}

export default Login; 