import React, { useState, useEffect, useRef } from 'react';

const financialVideos = [
  {
    "title": "The Four Major Fundamental",
    "description": "Explore the key principles of financial literacy in this Hindi video, helping you understand the basics of managing money effectively.",
    "youtubeId": "_sFMEto7gdY"
  },
  {
    "title": "Banking Fundamentals",
    "description": "Banks are a riddle wrapped up in an enigma. We try to shed light on the banking system—why banks were invented, how they caused the last crisis, and what alternatives exist.",
    "youtubeId": "fTTGALaRZoc"
  },
  {
    "title": "Types of Bank Accounts in India",
    "description": "Learn about different types of bank accounts available in India, their features, and how to choose the right one for your financial needs.",
    "youtubeId": "WT8Gei4OHJc"
  },
  {
    "title": "Types of BANK ACCOUNTS in India",
    "description": "Understand the various bank account types in India including savings, current, fixed deposit, and recurring deposit accounts.",
    "youtubeId": "2Nz01IxaZUo"
  },
  {
    "title": "Top 10 Financial Concepts You Must Know | CA Rachana Ranade",
    "description": "CA Rachana Ranade explains the top 10 financial concepts that everyone should understand to make informed financial decisions.",
    "youtubeId": "WN9Mks1s4tM"
  },
  {
    "title": "FD Fundamentals",
    "description": "पोस्ट ऑफिसच्या 10 सर्वोत्तम योजना – Learn about the top 10 post office schemes in Marathi, including fixed deposit options and benefits.",
    "youtubeId": "GUdFWy6pUbU"
  },
  {
    "title": "Fixed Deposit और Recurring Deposit में क्या है अंतर? | Zee Business",
    "description": "Zee Business explains the difference between Fixed Deposit and Recurring Deposit, helping viewers choose the best investment option.",
    "youtubeId": "SI8EOCjDXoc"
  },
  {
    "title": "Sukanya Samriddhi Yojana 2025",
    "description": "Detailed overview of the Sukanya Samriddhi Yojana for 2025, including benefits, eligibility, and how to invest for your daughter's future.",
    "youtubeId": "StOvo1daSdg"
  },
  {
    "title": "5 Good Government Investment Schemes",
    "description": "Discover five beneficial government investment schemes that can help you grow your savings securely and efficiently.",
    "youtubeId": "SADt3RtzxzM"
  }
];

const features = [
  { icon: 'fa-user-graduate', title: 'Financial Literacy', desc: 'Learn the basics of money, saving, and investing.' },
  { icon: 'fa-bullseye', title: 'Goal Setting', desc: 'Set, track, and achieve your financial goals.' },
  { icon: 'fa-lightbulb', title: 'Personalized Advice', desc: 'Get tailored financial guidance for your needs.' },
  { icon: 'fa-wallet', title: 'Budgeting Tools', desc: 'Plan and manage your spending with smart tools.' },
  { icon: 'fa-chart-pie', title: 'Investment Education', desc: 'Understand investment options and grow your wealth.' },
  { icon: 'fa-credit-card', title: 'Credit Improvement', desc: 'Tips and tools to build and maintain good credit.' },
];

const stats = [
  { value: '1M+', label: 'Happy Customers' },
  { value: '₹5000+ Cr', label: 'Transacted' },
  { value: '4.8/5', label: 'App Store Rating' },
  { value: '99.99%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Amit S.', text: 'ArthSetu(Bridge for Finance) made my finances so easy to manage. Highly recommended!' },
  { name: 'Priya K.', text: 'The app is super intuitive and the support is fantastic.' },
  { name: 'Ramesh V.', text: 'I love the investment options and the security features.' },
];

const securityBadges = [
  { icon: 'fa-shield-alt', label: '256-bit SSL Encryption' },
  { icon: 'fa-lock', label: '2FA Enabled' },
  { icon: 'fa-university', label: 'RBI Compliant' },
  { icon: 'fa-user-check', label: 'KYC Verified' },
];

const Home = () => {
  const [language, setLanguage] = useState('');
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const autoRestartRef = useRef(true);
  const [showLangModal, setShowLangModal] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!language) {
      setShowLangModal(true);
      const synth = window.speechSynthesis;
      if (synth) {
        const utter = new window.SpeechSynthesisUtterance(
          'Please select your language: English, Hindi, or Marathi.'
        );
        utter.lang = 'en-IN';
        synth.cancel();
        synth.speak(utter);
      }
    }
  }, [language]);

  useEffect(() => {
    if (language) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      setListening(false);
      setShowLangModal(false);
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setSpeechError('');
    setListening(true);
    autoRestartRef.current = true;
    recognition.start();
    recognition.onresult = (event) => {
      setListening(false);
      autoRestartRef.current = false;
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes('english')) {
        setLanguage('en');
      } else if (transcript.includes('hindi') || transcript.includes('हिंदी')) {
        setLanguage('hi');
      } else if (transcript.includes('marathi') || transcript.includes('मराठी')) {
        setLanguage('mr');
      } else {
        setSpeechError('Could not recognize the language. Please try again.');
        autoRestartRef.current = true;
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      setSpeechError('Speech recognition error: ' + event.error);
      autoRestartRef.current = true;
    };
    recognition.onend = () => {
      setListening(false);
      if (!language && autoRestartRef.current) {
        setTimeout(() => {
          if (!language) {
            setListening(true);
            recognition.start();
          }
        }, 500);
      }
    };
    return () => {
      autoRestartRef.current = false;
      recognition.onend = null;
      recognition.stop();
    };
  }, [language]);

  const handleSetLanguage = (lang) => {
    autoRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    setLanguage(lang);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', background: '#f6f8fa', minHeight: '100vh' }}>
      {/* Custom styles for animated welcome banner */}
      <style>{`
        .arthsetu-welcome {
          font-size: 2.7rem;
          font-weight: 800;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          animation: fadeInWelcome 1.2s cubic-bezier(.4,0,.2,1);
          position: relative;
          display: inline-block;
        }
        .arthsetu-welcome::after {
          content: '';
          display: block;
          width: 80%;
          height: 5px;
          margin: 0.5rem auto 0 auto;
          border-radius: 3px;
          background: linear-gradient(90deg, #764ba2 0%, #4facfe 100%);
          box-shadow: 0 0 16px 2px #764ba288;
          animation: glowUnderline 1.5s 0.7s both;
        }
        @keyframes fadeInWelcome {
          0% { opacity: 0; transform: translateY(-30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowUnderline {
          0% { width: 0; opacity: 0; }
          100% { width: 80%; opacity: 1; }
        }
        .arthsetu-subtitle {
          opacity: 0;
          animation: fadeInSubtitle 1.2s 0.7s forwards;
        }
        @keyframes fadeInSubtitle {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  <i className="fas fa-language me-2"></i>
                  Select Your Language
                </h5>
              </div>
              <div className="modal-body">
                <p className="mb-4">Please select your language:</p>
                <div className="d-flex flex-column gap-3 align-items-center">
                  <button className="btn btn-outline-primary btn-lg w-100" onClick={() => handleSetLanguage('en')}>English</button>
                  <button className="btn btn-outline-primary btn-lg w-100" onClick={() => handleSetLanguage('hi')}>हिन्दी (Hindi)</button>
                  <button className="btn btn-outline-primary btn-lg w-100" onClick={() => handleSetLanguage('mr')}>मराठी (Marathi)</button>
                  <div className="mt-3">
                    <span className="badge bg-secondary">
                      <i className={`fas fa-microphone${listening ? '-alt' : ''} me-2`}></i>
                      {listening ? 'Listening for your language...' : 'Not listening'}
                    </span>
                  </div>
                  {speechError && <div className="alert alert-danger mt-3" role="alert">{speechError}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal for Learn More */}
      {showInfoModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  <i className="fas fa-info-circle me-2"></i>
                  More Information
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowInfoModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">Login for free to check out more details.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowInfoModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner - only show after language is selected */}
      {!showLangModal && (
        <div className="container mb-5">
          <div className="py-5 px-3 rounded shadow-sm bg-white" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h1 className="arthsetu-welcome mb-2">Welcome to ArthSetu(Bridge for Finance)</h1>
            <p className="arthsetu-subtitle lead text-muted mb-4">Your personal financial guidance app—empowering you to make smarter money decisions, save more, and achieve your financial goals with confidence.</p>
            <button className="btn btn-primary btn-lg px-4 me-2">Login</button>
            <button className="btn btn-outline-primary btn-lg px-4">Sign Up</button>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="container mb-5">
        <div className="row g-4 justify-content-center">
          {features.map((f, idx) => (
            <div className="col-6 col-md-4 col-lg-2" key={idx}>
              <div className="p-4 bg-white rounded shadow-sm h-100 d-flex flex-column align-items-center justify-content-between">
                <i className={`fas ${f.icon} fa-2x text-primary mb-3`}></i>
                <h6 className="fw-bold mb-1">{f.title}</h6>
                <p className="text-muted small mb-2">{f.desc}</p>
                <button className="btn btn-outline-primary btn-sm mt-auto" style={{ marginTop: 'auto' }} onClick={() => setShowInfoModal(true)}>Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mb-5">
        <div className="row g-4 justify-content-center">
          {stats.map((s, idx) => (
            <div className="col-6 col-md-3" key={idx}>
              <div className="p-4 bg-white rounded shadow-sm h-100 d-flex flex-column align-items-center">
                <h2 className="fw-bold text-success mb-1">{s.value}</h2>
                <p className="text-muted mb-0">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Help Videos Section (Horizontal Scroll) */}
      <div className="container mb-5">
        <h4 className="fw-bold text-primary mb-4 text-center">Financial Help Videos</h4>
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '1.5rem',
            paddingBottom: '1rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {financialVideos.map((video, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 320,
                maxWidth: 340,
                flex: '0 0 auto',
                background: '#f8f9fa',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: 'none',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div className="ratio ratio-16x9" style={{ borderRadius: 8, overflow: 'hidden' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none', width: '100%', height: '100%' }}
                ></iframe>
              </div>
              <div className="card-body" style={{ padding: '1rem' }}>
                <h6 className="card-title text-primary mb-2" style={{ fontWeight: 600 }}>{video.title}</h6>
                <p className="card-text text-muted" style={{ fontSize: '0.95rem' }}>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mb-5">
        <h4 className="fw-bold text-primary mb-4 text-center">What Our Users Say</h4>
        <div className="row g-4 justify-content-center">
          {testimonials.map((t, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="p-4 bg-white rounded shadow-sm h-100">
                <i className="fas fa-quote-left fa-lg text-primary mb-3"></i>
                <p className="mb-3">{t.text}</p>
                <h6 className="fw-bold mb-0">{t.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Badges */}
      <div className="container mb-5">
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {securityBadges.map((b, idx) => (
            <div key={idx} className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
              <i className={`fas ${b.icon} text-success`}></i>
              <span className="fw-semibold text-muted small">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 