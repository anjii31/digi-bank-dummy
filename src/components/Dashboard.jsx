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
import govtSchemeVideos from '../data/govtSchemeVideos';
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
      welcome: 'Welcome to ArthSetu (Bridge to Finance)',
      updateProfile: 'Update Profile / Onboarding',
      getPlanner: 'Get your own personal planner',
      goToPlanner: 'Go to Investment Planner',
      govSchemes: 'Government Schemes for You',
      signOut: 'Sign Out',
      signingOut: 'Signing Out...',
      profile: 'Profile',
      settings: 'Settings',
      aiAssistant: 'AI Assistant',
      voiceAssistant: 'Voice Assistant',
      openChatbot: 'Opening chatbot assistant...',
      signingOutFeedback: 'Signing out...',
      alreadyDashboard: 'You are already on the dashboard',
      tryAgain: 'Try Again',
      contactSupport: 'Contact Support',
      help: 'Help',
    },
    hi: {
      welcome: 'ArthSetu (Bridge to Finance) में आपका स्वागत है',
      updateProfile: 'प्रोफ़ाइल/ऑनबोर्डिंग अपडेट करें',
      getPlanner: 'अपना व्यक्तिगत योजनाकार प्राप्त करें',
      goToPlanner: 'निवेश योजनाकार पर जाएं',
      govSchemes: 'आपके लिए सरकारी योजनाएं',
      signOut: 'लॉगआउट',
      signingOut: 'लॉगआउट हो रहा है...',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      aiAssistant: 'एआई सहायक',
      voiceAssistant: 'वॉयस सहायक',
      openChatbot: 'चैटबोट सहायक खोल रहा है...',
      signingOutFeedback: 'लॉगआउट हो रहा है...',
      alreadyDashboard: 'आप पहले से ही डैशबोर्ड पर हैं',
      tryAgain: 'पुनः प्रयास करें',
      contactSupport: 'संपर्क सहायता',
      help: 'मदद',
    },
    mr: {
      welcome: 'ArthSetu (Bridge to Finance) मध्ये आपले स्वागत आहे',
      updateProfile: 'प्रोफाइल/ऑनबोर्डिंग अपडेट करा',
      getPlanner: 'तुमचा वैयक्तिक नियोजक मिळवा',
      goToPlanner: 'इन्व्हेस्टमेंट प्लॅनरकडे जा',
      govSchemes: 'तुमच्यासाठी सरकारी योजना',
      signOut: 'लॉगआउट',
      signingOut: 'लॉगआउट होत आहे...',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्ज',
      aiAssistant: 'एआय सहाय्यक',
      voiceAssistant: 'व्हॉइस सहाय्यक',
      openChatbot: 'चॅटबोट सहाय्यक उघडत आहे...',
      signingOutFeedback: 'लॉगआउट होत आहे...',
      alreadyDashboard: 'आपण आधीच डॅशबोर्डवर आहात',
      tryAgain: 'पुन्हा प्रयत्न करा',
      contactSupport: 'संपर्क समर्थन',
      help: 'मदत',
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

  // After the welcome section, add the filtered video cards
  const filteredVideos = profile ? govtSchemeVideos.filter(v =>
    v.userType.toLowerCase() === profile.userType?.toLowerCase()
  ) : [];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Fullscreen background image and overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: `linear-gradient(rgba(246,248,250,0.7), rgba(246,248,250,0.7)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat fixed`,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)'
      }} />
      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigation Header */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
          <div className="container">
            <div className="navbar-brand d-flex align-items-center">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                   style={{width: '40px', height: '40px'}}>
                <i className="fas fa-university text-primary"></i>
              </div>
              <span className="fw-bold">{t.welcome}</span>
            </div>
            
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="fas fa-user-circle me-2"></i>
                  {currentUser?.displayName || currentUser?.email}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#"><i className="fas fa-user me-2"></i>{t.profile}</a></li>
                  <li><a className="dropdown-item" href="#"><i className="fas fa-cog me-2"></i>{t.settings}</a></li>
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
                          {t.signingOut}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-out-alt me-2"></i>
                          {t.signOut}
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
              <div className="card border-0 shadow-sm" style={{ background: 'rgba(255,255,255,0)', border: 'none', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}>
                <div className="card-body">
                  <h2 className="card-title text-primary mb-3">
                    <i className="fas fa-home me-2"></i>
                    {t.welcome}
                  </h2>
                  <button className="btn btn-outline-primary me-2" onClick={() => navigate('/onboarding')}>
                    <i className="fas fa-user-edit me-2"></i>
                    {t.updateProfile}
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Planner Card */}
            <div className="col-12 mb-4">
              <div
                className="card border-0 shadow-sm"
                style={{
                  cursor: 'pointer',
                  background: 'linear-gradient(120deg, rgba(123,67,151,0.65) 0%, rgba(220,36,48,0.55) 100%)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)'
                }}
                onClick={() => navigate('/investment-planner')}
              >
                <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
                  <i className="fas fa-calendar-check fa-2x mb-3" style={{ color: '#fff' }}></i>
                  <h4 className="fw-bold mb-2" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{t.getPlanner}</h4>
                  <button
                    className="btn btn-light btn-lg mt-2"
                    style={{ color: '#7b4397', fontWeight: 700 }}
                    onClick={e => { e.stopPropagation(); navigate('/investment-planner'); }}
                  >
                    {t.goToPlanner}
                  </button>
                </div>
              </div>
            </div>

            {/* Government Scheme Videos */}
            {filteredVideos.length > 0 && (
              <div className="col-12 mb-4">
                <h4 className="fw-bold text-primary mb-3">{t.govSchemes}</h4>
                <div className="row g-4">
                  {filteredVideos.map((video, idx) => (
                    <div className="col-md-4" key={video.youtubeId + idx}>
                      <div
                        className="card h-100 shadow-sm"
                        style={{
                          background: 'rgba(40, 44, 52, 0.85)',
                          border: '1px solid #343a40',
                          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25), 0 1.5px 6px 0 rgba(0,0,0,0.18)',
                          borderRadius: 16,
                          color: '#fff'
                        }}
                      >
                        <div className="card-body">
                          <h6 className="fw-bold mb-2 text-info" style={{ color: '#fff' }}>{video.govtScheme}</h6>
                          <div className="ratio ratio-16x9 mb-2">
                            <iframe
                              src={`https://www.youtube.com/embed/${video.youtubeId}`}
                              title={video.govtScheme}
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remove Security Status and Voice Assistant Info cards */}
          </div>
        </div>

        {/* Chatbot Component */}
        <Chatbot 
          isOpen={chatbotOpen}
          onToggle={setChatbotOpen}
        />

        {/* Voice Assistant fixed at right center */}
      <div style={{ position: 'fixed', top: '20%', right: 32, transform: 'translateY(-50%)', zIndex: 1100 }}>
        <VoiceAssistant
          onVoiceCommand={handleVoiceCommand}
          currentPage="login"
        />
      </div>
      </div>
    </div>
  );
}

export default Dashboard; 