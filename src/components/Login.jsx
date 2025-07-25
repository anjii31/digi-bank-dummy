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
      setError('Failed to sign in: ' + error.message);
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
        } else if (command.field === 'password') {
          setPassword(command.value);
          setVoiceFeedback('Password entered');
        }
        break;
      
      case 'submit':
        handleSubmit(new Event('submit'));
        setVoiceFeedback('Submitting login form...');
        break;
      
      case 'navigate':
        if (command.target === 'signup') {
          navigate('/signup');
          setVoiceFeedback('Navigating to sign up page...');
        }
        break;
      
      case 'clear':
        setEmail('');
        setPassword('');
        setVoiceFeedback('Form cleared');
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
      welcomeBack: 'Welcome Back',
      signInTo: 'Sign in to your ArthSetu (Bridge to finance) account',
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
      errorPrefix: 'Failed to sign in:',
    },
    hi: {
      welcomeBack: 'वापस स्वागत है',
      signInTo: 'अपने ArthSetu (Bridge to finance) खाते में साइन इन करें',
      email: 'ईमेल पता',
      emailPlaceholder: "अपना ईमेल दर्ज करें या 'मेरा ईमेल है' बोलें और फिर अपना ईमेल बताएं",
      password: 'पासवर्ड',
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें या 'मेरा पासवर्ड है' बोलें और फिर अपना पासवर्ड बताएं",
      rememberMe: 'मुझे याद रखें',
      forgotPassword: 'पासवर्ड भूल गए?',
      signingIn: 'साइन इन हो रहा है...',
      signIn: 'साइन इन',
      dontHaveAccount: 'कोई खाता नहीं है?',
      createAccount: 'खाता बनाएं',
      ssl: '256-बिट SSL एन्क्रिप्शन',
      voice: 'वॉयस कमांड उपलब्ध हैं - माइक्रोफोन बटन पर क्लिक करें',
      errorPrefix: 'साइन इन विफल:',
    },
    mr: {
      welcomeBack: 'पुन्हा स्वागत आहे',
      signInTo: 'तुमच्या ArthSetu (Bridge to finance) खात्यात साइन इन करा',
      email: 'ईमेल पत्ता',
      emailPlaceholder: "तुमचा ईमेल प्रविष्ट करा किंवा 'माझा ईमेल आहे' असे बोला आणि नंतर तुमचा ईमेल सांगा",
      password: 'पासवर्ड',
      passwordPlaceholder: "तुमचा पासवर्ड प्रविष्ट करा किंवा 'माझा पासवर्ड आहे' असे बोला आणि नंतर तुमचा पासवर्ड सांगा",
      rememberMe: 'मला लक्षात ठेवा',
      forgotPassword: 'पासवर्ड विसरलात?',
      signingIn: 'साइन इन होत आहे...',
      signIn: 'साइन इन',
      dontHaveAccount: 'खाते नाहीये?',
      createAccount: 'खाते तयार करा',
      ssl: '256-बिट SSL एनक्रिप्शन',
      voice: 'व्हॉइस कमांड उपलब्ध - मायक्रोफोन बटणावर क्लिक करा',
      errorPrefix: 'साइन इन अयशस्वी:',
    }
  };
  const t = translations[language] || translations.en;

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        minHeight: '100vh',
        background: `linear-gradient(rgba(246,248,250,0.7), rgba(246,248,250,0.7)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat fixed`,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <style>{`
        .login-card {
          background: rgba(255,255,255,0.75);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border-radius: 24px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .login-card .card-body {
          padding: 2.5rem 2rem;
        }
        .login-card .form-control {
          background: rgba(255,255,255,0.85);
          border-radius: 12px;
        }
        .login-card .btn-primary {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 2px 8px rgba(118,75,162,0.12);
        }
        .login-card .btn-primary:active, .login-card .btn-primary:focus {
          background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
        }
        .login-card .form-label {
          font-weight: 600;
        }
        .login-card .bank-logo {
          box-shadow: 0 2px 12px 0 rgba(102,126,234,0.18);
        }
        .login-card .security-icon {
          box-shadow: 0 1px 4px 0 rgba(102,126,234,0.10);
        }
        .login-card .text-primary {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .login-card .btn-outline-secondary {
          border-radius: 12px;
        }
        .login-card .alert-info {
          background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
          color: #4f46e5;
          border: none;
        }
        .login-card .alert-danger {
          background: linear-gradient(90deg, #ffe0e0 0%, #f3e8ff 100%);
          color: #b91c1c;
          border: none;
        }
      `}</style>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 login-card">
              <div className="card-body p-5">
                {/* Bank Logo Section */}
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 bank-logo" 
                         style={{width: '60px', height: '60px'}}>
                      <i className="fas fa-university text-white fs-4"></i>
                    </div>
                    <div>
                      <h3 className="mb-0 text-primary fw-bold">ArthSetu</h3>
                      <small className="text-muted">Digital Banking Solutions</small>
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
                <p className="text-center text-muted mb-4">{t.signInTo}</p>

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
                    {t.errorPrefix} {error}
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

      {/* Voice Assistant fixed at right center */}
      <div style={{ position: 'fixed', top: '20%', right: 32, transform: 'translateY(-50%)', zIndex: 1100 }}>
        <VoiceAssistant
          onVoiceCommand={handleVoiceCommand}
          currentPage="login"
        />
      </div>
    </div>
  );
}

export default Login; 