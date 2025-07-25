import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
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
          setVoiceFeedback(`Name set to: ${command.value}`);
        } else if (command.field === 'email') {
          setEmail(command.value);
          setVoiceFeedback(`Email set to: ${command.value}`);
        } else if (command.field === 'password') {
          setPassword(command.value);
          setConfirmPassword(command.value);
          setVoiceFeedback('Password entered and confirmed');
        }
        break;
      
      case 'submit':
        handleSubmit(new Event('submit'));
        setVoiceFeedback('Creating account...');
        break;
      
      case 'navigate':
        if (command.target === 'login') {
          navigate('/login');
          setVoiceFeedback('Navigating to login page...');
        }
        break;
      
      case 'clear':
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
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
                      <h3 className="mb-0 text-primary fw-bold">ArthSetu</h3>
                      <small className="text-muted">Digital Banking Solutions</small>
                    </div>
                  </div>
                </div>

                <h2 className="text-center mb-4 fw-bold text-dark">Create Account</h2>
                <p className="text-center text-muted mb-4">Join ArthSetu today</p>

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
                      Full Name
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
                        placeholder="Enter your full name or say 'my name is' followed by your name"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Address
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
                        placeholder="Enter your email or say 'my email is' followed by your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Password
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
                        placeholder="Enter your password or say 'my password is' followed by your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Confirm Password
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
                        placeholder="Confirm your password"
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-muted mb-0">Already have an account?</p>
                    <a href="/login" className="text-primary text-decoration-none fw-semibold">
                      Sign In
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
        currentPage="signup"
      />
    </div>
  );
}

export default Signup; 