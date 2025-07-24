import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import VoiceAssistant from './VoiceAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  // Onboarding profile and recommendations
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const { language } = useLanguage();

  const translations = {
    en: {
      welcome: 'Welcome to DigiBank',
      overview: `Hello, {name}! Here's your banking overview.`,
      updateProfile: 'Update Profile / Onboarding',
      viewWelcome: 'View Welcome & Recommendations',
      voice: 'Voice commands available - Try "open chat" or "logout"',
      profile: 'Profile',
      settings: 'Settings',
      signOut: 'Sign Out',
      signingOut: 'Signing Out...',
      assistant: 'Voice Assistant Available',
      assistantDesc: 'Use voice commands to navigate and interact with your banking dashboard. Click the microphone button in the top-right corner to get started.',
      openChat: '"Open chat"',
      talk: 'Talk to assistant',
      logout: '"Logout"',
      signOutSmall: 'Sign out'
    },
    hi: {
      welcome: 'DigiBank में आपका स्वागत है',
      overview: 'नमस्ते, {name}! यह है आपका बैंकिंग अवलोकन।',
      updateProfile: 'प्रोफ़ाइल अपडेट करें / ऑनबोर्डिंग',
      viewWelcome: 'स्वागत और अनुशंसाएँ देखें',
      voice: 'वॉइस कमांड उपलब्ध हैं - "open chat" या "logout" आज़माएँ',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      signOut: 'साइन आउट',
      signingOut: 'साइन आउट हो रहा है...',
      assistant: 'वॉइस असिस्टेंट उपलब्ध',
      assistantDesc: 'अपने बैंकिंग डैशबोर्ड में नेविगेट और इंटरैक्ट करने के लिए वॉइस कमांड का उपयोग करें। शुरू करने के लिए ऊपर दाएँ कोने में माइक्रोफोन बटन पर क्लिक करें।',
      openChat: '"Open chat"',
      talk: 'सहायक से बात करें',
      logout: '"Logout"',
      signOutSmall: 'साइन आउट'
    },
    mr: {
      welcome: 'DigiBank मध्ये आपले स्वागत आहे',
      overview: 'नमस्कार, {name}! हे आहे तुमचे बँकिंग अवलोकन.',
      updateProfile: 'प्रोफाइल अपडेट करा / ऑनबोर्डिंग',
      viewWelcome: 'स्वागत आणि शिफारसी पहा',
      voice: 'व्हॉइस कमांड उपलब्ध आहेत - "open chat" किंवा "logout" वापरा',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्ज',
      signOut: 'साइन आउट',
      signingOut: 'साइन आउट होत आहे...',
      assistant: 'व्हॉइस सहाय्यक उपलब्ध',
      assistantDesc: 'तुमच्या बँकिंग डॅशबोर्डमध्ये नेव्हिगेट आणि संवाद साधण्यासाठी व्हॉइस कमांड वापरा. सुरू करण्यासाठी वर उजव्या कोपर्यातील मायक्रोफोन बटणावर क्लिक करा.',
      openChat: '"Open chat"',
      talk: 'सहाय्यकाशी बोला',
      logout: '"Logout"',
      signOutSmall: 'साइन आउट'
    }
  };
  const t = translations[language] || translations.en;

  // Fetch onboarding profile from Firestore
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      setProfileLoading(true);
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null);
      }
      setProfileLoading(false);
    }
    fetchProfile();
  }, [currentUser]);

  // Rule-based recommendations
  useEffect(() => {
    if (!profile) return;
    const recs = [];
    if (profile.savings && Number(profile.savings) < 1000) {
      recs.push({
        text: 'Start a savings goal to build an emergency fund.',
        link: '#',
        why: 'Your current savings are low. An emergency fund helps you handle unexpected expenses.'
      });
    }
    if (profile.userType === 'vendor' && profile.goals && profile.goals.toLowerCase().includes('expand')) {
      recs.push({
        text: 'Explore small business loans or investment plans.',
        link: '#',
        why: 'You mentioned wanting to expand your business. Funding options can help you grow.'
      });
    }
    if (profile.comfort === 'beginner') {
      recs.push({
        text: 'View our beginner’s guide to money management.',
        link: '#',
        why: 'You indicated you are new to financial concepts. Start with the basics!'
      });
    }
    if (profile.income && (!profile.expenses || Number(profile.income) > Number(profile.expenses))) {
      recs.push({
        text: 'Consider investing your surplus income for future growth.',
        link: '#',
        why: 'Investing can help your money grow over time.'
      });
    }
    if (profile.userType === 'shg') {
      recs.push({
        text: 'Invite group members to join and track group savings together.',
        link: '#',
        why: 'SHG groups benefit from collective tracking and planning.'
      });
    }
    if (recs.length === 0) {
      recs.push({
        text: 'Add your first income or expense to get started!',
        link: '#',
        why: 'Tracking your finances helps you make better decisions.'
      });
    }
    setRecommendations(recs);
  }, [profile]);

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
    setLoading(false);
  }

  // Handle voice commands
  const handleVoiceCommand = (command, transcript) => {
    console.log('Voice command received:', command);
    
    switch (command.action) {
      case 'open_chatbot':
        setChatbotOpen(true);
        setVoiceFeedback('Opening chatbot assistant...');
        break;
      
      case 'logout':
        handleLogout();
        setVoiceFeedback('Signing out...');
        break;
      
      case 'navigate':
        if (command.target === 'dashboard') {
          setVoiceFeedback('You are already on the dashboard');
        }
        break;
      
      case 'unknown':
        setVoiceFeedback(`I heard: "${transcript}". Try saying "open chat" for the assistant or "logout" to sign out.`);
        break;
      
      default:
        setVoiceFeedback(`Processing: ${transcript}`);
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => setVoiceFeedback(''), 3000);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <div className="navbar-brand d-flex align-items-center">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style={{width: '40px', height: '40px'}}>
              <i className="fas fa-university text-primary"></i>
            </div>
            <span className="fw-bold">DigiBank</span>
          </div>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                <i className="fas fa-user-circle me-2"></i>
                {currentUser?.displayName || currentUser?.email}
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#"><i className="fas fa-user me-2"></i>Profile</a></li>
                <li><a className="dropdown-item" href="#"><i className="fas fa-cog me-2"></i>Settings</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Sign Out
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Voice Feedback Alert */}
      {voiceFeedback && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-5" style={{ zIndex: 1000 }}>
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            <i className="fas fa-microphone me-2"></i>
            {voiceFeedback}
            <button type="button" className="btn-close" onClick={() => setVoiceFeedback('')}></button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="container py-4">
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-primary mb-3">
                  <i className="fas fa-home me-2"></i>
                  {t.welcome}
                </h2>
                <p className="card-text text-muted">
                  {t.overview.replace('{name}', currentUser?.displayName || 'Valued Customer')}
                </p>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fas fa-microphone text-primary"></i>
                  <small className="text-muted">{t.voice}</small>
                </div>
                <button className="btn btn-outline-primary me-2" onClick={() => navigate('/onboarding')}>
                  <i className="fas fa-user-edit me-2"></i>
                  {t.updateProfile}
                </button>
                <button className="btn btn-outline-success" onClick={() => navigate('/welcome')}>
                  <i className="fas fa-star me-2"></i>
                  {t.viewWelcome}
                </button>
              </div>
            </div>
          </div>

          {/* Account Balance */}
          <div className="col-md-6 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-wallet text-primary me-2"></i>
                    Account Balance
                  </h5>
                  <i className="fas fa-ellipsis-v text-muted"></i>
                </div>
                <h3 className="text-success fw-bold">$24,567.89</h3>
                <p className="text-muted small mb-0">
                  <i className="fas fa-arrow-up text-success me-1"></i>
                  +$1,234.56 this month
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="col-md-6 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-exchange-alt text-primary me-2"></i>
                    Recent Transactions
                  </h5>
                  <a href="#" className="text-primary text-decoration-none small">View All</a>
                </div>
                <div className="space-y-2">
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <p className="mb-0 fw-semibold">Netflix Subscription</p>
                      <small className="text-muted">Today, 2:30 PM</small>
                    </div>
                    <span className="text-danger fw-bold">-$15.99</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <p className="mb-0 fw-semibold">Salary Deposit</p>
                      <small className="text-muted">Yesterday, 9:00 AM</small>
                    </div>
                    <span className="text-success fw-bold">+$3,500.00</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <p className="mb-0 fw-semibold">Grocery Store</p>
                      <small className="text-muted">2 days ago</small>
                    </div>
                    <span className="text-danger fw-bold">-$89.45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-md-6 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="fas fa-bolt text-primary me-2"></i>
                  Quick Actions
                </h5>
                <div className="row g-2">
                  <div className="col-6">
                    <button className="btn btn-outline-primary w-100 py-3">
                      <i className="fas fa-paper-plane mb-2 d-block"></i>
                      Send Money
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-success w-100 py-3">
                      <i className="fas fa-plus mb-2 d-block"></i>
                      Add Money
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-info w-100 py-3">
                      <i className="fas fa-credit-card mb-2 d-block"></i>
                      Pay Bills
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-warning w-100 py-3">
                      <i className="fas fa-chart-line mb-2 d-block"></i>
                      Investments
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="fas fa-shield-alt text-success me-2"></i>
                  Security Status
                </h5>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>2FA Enabled</span>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>SSL Secure</span>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>Account Locked</span>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                      <span>Update Password</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Assistant Info */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-microphone me-2"></i>
                  {t.assistant}
                </h6>
                <p className="text-muted mb-3">
                  {t.assistantDesc}
                </p>
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="p-3 bg-light rounded">
                          <i className="fas fa-comments text-primary mb-2"></i>
                          <p className="mb-0 small fw-semibold">{t.openChat}</p>
                          <small className="text-muted">{t.talk}</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 bg-light rounded">
                          <i className="fas fa-sign-out-alt text-danger mb-2"></i>
                          <p className="mb-0 small fw-semibold">{t.logout}</p>
                          <small className="text-muted">{t.signOutSmall}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot 
        isOpen={chatbotOpen}
        onToggle={setChatbotOpen}
      />

      {/* Voice Assistant Component */}
      <VoiceAssistant 
        onVoiceCommand={handleVoiceCommand}
        currentPage="dashboard"
      />
    </div>
  );
}

export default Dashboard; 