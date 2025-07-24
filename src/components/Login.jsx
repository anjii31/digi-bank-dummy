import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';

function Login() {
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
      navigate('/dashboard');
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
                      <h3 className="mb-0 text-primary fw-bold">ArthSetu(Bridge for Finance)</h3>
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

                <h2 className="text-center mb-4 fw-bold text-dark">Welcome Back</h2>
                <p className="text-center text-muted mb-4">Sign in to your ArthSetu(Bridge for Finance) account</p>

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
                      Email Address
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
                        placeholder="Enter your email or say 'my email is' followed by your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Password
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
                        placeholder="Enter your password or say 'my password is' followed by your password"
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
                        Remember me
                      </label>
                    </div>
                    <a href="/forgot-password" className="text-primary text-decoration-none fw-semibold">
                      Forgot Password?
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-muted mb-0">Don't have an account?</p>
                    <a href="/signup" className="text-primary text-decoration-none fw-semibold">
                      Create Account
                    </a>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="text-center mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <i className="fas fa-shield-alt text-success security-icon"></i>
                    <small className="text-muted">256-bit SSL Encryption</small>
                  </div>
                </div>

                {/* Voice Assistant Info */}
                <div className="text-center mt-3">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <i className="fas fa-microphone text-primary"></i>
                    <small className="text-muted">Voice commands available - Click the microphone button</small>
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