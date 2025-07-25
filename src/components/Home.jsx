import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  { icon: 'fa-lightbulb', title: 'Personalized Investment Planner', desc: 'Get tailored investment plan for your needs.' },
  { icon: 'fa-wallet', title: 'AI chat assistance', desc: 'Ask anything from your own AI finance assistant.' },
  { icon: 'fa-chart-pie', title: 'Finance at your doorstep', desc: 'Get financial services at your doorstep.' },
];

const stats = [
  { value: '1M+', label: 'Happy Customers' },
  { value: '₹5000+ Cr', label: 'Transacted' },
  { value: '4.8/5', label: 'App Store Rating' },
  { value: '99.99%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Amit S.', text: 'ArthSetu (Bridge to finance) made my finances so easy to manage. Highly recommended!' },
  { name: 'Priya K.', text: 'The app is super intuitive and the support is fantastic.' },
  { name: 'Ramesh V.', text: 'I love the investment options and the security features.' },
];

const securityBadges = [
  { icon: 'fa-shield-alt', label: '256-bit SSL Encryption' },
  { icon: 'fa-lock', label: '2FA Enabled' },
  { icon: 'fa-university', label: 'RBI Compliant' },
  { icon: 'fa-user-check', label: 'KYC Verified' },
];

const OnboardingGuard = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const checkOnboarding = async () => {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || !docSnap.data().onboardingComplete) {
        navigate('/onboarding');
      } else {
        setLoading(false);
      }
    };
    checkOnboarding();
  }, [currentUser, navigate]);

  if (loading) return null;
  return children;
};

const Home = () => {
  const { language } = useLanguage();
  // All hooks must be at the top level
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const autoRestartRef = useRef(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Remove the language modal logic and its rendering

  // Remove the modal JSX for showLangModal

  // Remove the conditional that returns null if not on home
  // Remove useEffect that sets showLangModal

  // Remove useEffect for speech recognition and setLanguage

  // Remove handleSetLanguage

  // Remove all references to showLangModal

  // Render the welcome banner and rest of the page unconditionally
  const translations = {
    en: {
      welcome: 'Welcome to ArthSetu (Bridge to finance)',
      subtitle: 'Your personal financial guidance app—empowering you to make smarter money decisions, save more, and achieve your financial goals with confidence.',
      selectLanguage: 'Select Your Language',
      pleaseSelect: 'Please select your language:',
      english: 'English',
      hindi: 'Hindi',
      marathi: 'Marathi',
      notListening: 'Not listening',
      listening: 'Listening for your language...',
      features: [
        { icon: 'fa-user-graduate', title: 'Financial Literacy', desc: 'Learn the basics of money, saving, and investing.' },
        { icon: 'fa-bullseye', title: 'Goal Setting', desc: 'Set, track, and achieve your financial goals.' },
        { icon: 'fa-lightbulb', title: 'Personalized Investment Planner', desc: 'Get tailored investment plan for your needs.' },
        { icon: 'fa-wallet', title: 'AI chat assistance', desc: 'Ask anything from your own AI finance assistant.' },
        { icon: 'fa-chart-pie', title: 'Finance at your doorstep', desc: 'Get financial services at your doorstep.' },
      ],
      stats: [
        { value: '1M+', label: 'Happy Customers' },
        { value: '₹5000+ Cr', label: 'Transacted' },
        { value: '4.8/5', label: 'App Store Rating' },
        { value: '99.99%', label: 'Uptime' },
      ],
      financialVideos: 'Financial Help Videos',
      testimonialsTitle: 'What Our Users Say',
      testimonials: [
        { name: 'Amit S.', text: 'ArthSetu (Bridge to finance) made my finances so easy to manage. Highly recommended!' },
        { name: 'Priya K.', text: 'The app is super intuitive and the support is fantastic.' },
        { name: 'Ramesh V.', text: 'I love the investment options and the security features.' },
      ],
      securityBadges: [
        { icon: 'fa-shield-alt', label: '256-bit SSL Encryption' },
        { icon: 'fa-lock', label: '2FA Enabled' },
        { icon: 'fa-university', label: 'RBI Compliant' },
        { icon: 'fa-user-check', label: 'KYC Verified' },
      ],
      learnMore: 'Learn More',
      whatUsersSay: 'What Our Users Say',
      close: 'Close',
      moreInfo: 'More Information',
      loginForMore: 'Login for free to check out more details.',
      closeBtn: 'Close',
    },
    hi: {
      welcome: 'ArthSetu (Bridge to finance) में आपका स्वागत है',
      subtitle: 'आपका व्यक्तिगत वित्तीय मार्गदर्शन ऐप—स्मार्ट पैसे के निर्णय लेने, अधिक बचत करने, और आत्मविश्वास के साथ अपने वित्तीय लक्ष्यों को प्राप्त करने के लिए।',
      selectLanguage: 'अपनी भाषा चुनें',
      pleaseSelect: 'कृपया अपनी भाषा चुनें:',
      english: 'अंग्रेज़ी',
      hindi: 'हिन्दी',
      marathi: 'मराठी',
      notListening: 'सुन नहीं रहा',
      listening: 'आपकी भाषा के लिए सुन रहा है...',
      features: [
        { icon: 'fa-user-graduate', title: 'वित्तीय साक्षरता', desc: 'पैसे, बचत और निवेश की मूल बातें जानें।' },
        { icon: 'fa-bullseye', title: 'लक्ष्य निर्धारण', desc: 'अपने वित्तीय लक्ष्यों को सेट, ट्रैक और प्राप्त करें।' },
        { icon: 'fa-lightbulb', title: 'व्यक्तिगत सलाह', desc: 'अपनी आवश्यकताओं के लिए अनुकूलित वित्तीय मार्गदर्शन प्राप्त करें।' },
        { icon: 'fa-wallet', title: 'बजटिंग टूल्स', desc: 'स्मार्ट टूल्स के साथ अपने खर्च की योजना बनाएं और प्रबंधित करें।' },
        { icon: 'fa-chart-pie', title: 'निवेश शिक्षा', desc: 'निवेश विकल्पों को समझें और अपनी संपत्ति बढ़ाएं।' },
        { icon: 'fa-credit-card', title: 'क्रेडिट सुधार', desc: 'अच्छा क्रेडिट बनाने और बनाए रखने के लिए टिप्स और टूल्स।' },
      ],
      stats: [
        { value: '1M+', label: 'खुश ग्राहक' },
        { value: '₹5000+ Cr', label: 'लेन-देन' },
        { value: '4.8/5', label: 'ऐप स्टोर रेटिंग' },
        { value: '99.99%', label: 'अपटाइम' },
      ],
      financialVideos: 'वित्तीय सहायता वीडिओ',
      testimonialsTitle: 'हमारे उपयोगकर्ताओं की राय',
      testimonials: [
        { name: 'अमित एस.', text: 'ArthSetu (Bridge to finance) ने मेरी वित्तीय प्रबंधन को बहुत आसान बना दिया। अत्यधिक अनुशंसित!' },
        { name: 'प्रिया के.', text: 'ऐप बहुत सहज है और समर्थन शानदार है।' },
        { name: 'रमेश वी.', text: 'मुझे निवेश विकल्प और सुरक्षा सुविधाएँ पसंद हैं।' },
      ],
      securityBadges: [
        { icon: 'fa-shield-alt', label: '256-बिट SSL एन्क्रिप्शन' },
        { icon: 'fa-lock', label: '2FA सक्षम' },
        { icon: 'fa-university', label: 'RBI अनुरूप' },
        { icon: 'fa-user-check', label: 'KYC सत्यापित' },
      ],
      learnMore: 'और जानें',
      whatUsersSay: 'हमारे उपयोगकर्ताओं की राय',
      close: 'बंद करें',
      moreInfo: 'अधिक जानकारी',
      loginForMore: 'अधिक विवरण देखने के लिए निःशुल्क लॉगिन करें।',
      closeBtn: 'बंद करें',
    },
    mr: {
      welcome: 'ArthSetu (Bridge to finance) मध्ये आपले स्वागत आहे',
      subtitle: 'तुमचा वैयक्तिक आर्थिक मार्गदर्शन अ‍ॅप—शहाणपणाने पैसे व्यवस्थापित करा, जास्त बचत करा, आणि आत्मविश्वासाने तुमची आर्थिक उद्दिष्टे साध्य करा.',
      selectLanguage: 'तुमची भाषा निवडा',
      pleaseSelect: 'कृपया तुमची भाषा निवडा:',
      english: 'इंग्रजी',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      notListening: 'ऐकत नाही',
      listening: 'तुमच्या भाषेसाठी ऐकत आहे...',
      features: [
        { icon: 'fa-user-graduate', title: 'आर्थिक साक्षरता', desc: 'पैसे, बचत आणि गुंतवणुकीच्या मूलभूत गोष्टी शिका.' },
        { icon: 'fa-bullseye', title: 'लक्ष्य निर्धारण', desc: 'तुमची आर्थिक उद्दिष्टे सेट, ट्रॅक आणि साध्य करा.' },
        { icon: 'fa-lightbulb', title: 'वैयक्तिक सल्ला', desc: 'तुमच्या गरजांसाठी वैयक्तिकृत आर्थिक मार्गदर्शन मिळवा.' },
        { icon: 'fa-wallet', title: 'बजेटिंग साधने', desc: 'स्मार्ट साधनांसह तुमचे खर्च नियोजित करा आणि व्यवस्थापित करा.' },
        { icon: 'fa-chart-pie', title: 'गुंतवणूक शिक्षण', desc: 'गुंतवणूक पर्याय समजून घ्या आणि तुमची संपत्ती वाढवा.' },
        { icon: 'fa-credit-card', title: 'क्रेडिट सुधारणा', desc: 'चांगला क्रेडिट तयार करण्यासाठी आणि राखण्यासाठी टिप्स आणि साधने.' },
      ],
      stats: [
        { value: '1M+', label: 'आनंदी ग्राहक' },
        { value: '₹5000+ Cr', label: 'व्यवहार' },
        { value: '4.8/5', label: 'अ‍ॅप स्टोअर रेटिंग' },
        { value: '99.99%', label: 'अपटाइम' },
      ],
      financialVideos: 'आर्थिक मदत व्हिडिओ',
      testimonialsTitle: 'आमच्या वापरकर्त्यांचे मत',
      testimonials: [
        { name: 'अमित एस.', text: 'ArthSetu (Bridge to finance) मुळे माझे आर्थिक व्यवस्थापन खूप सोपे झाले. अत्यंत शिफारसीय!' },
        { name: 'प्रिया के.', text: 'अ‍ॅप खूप सहज आहे आणि समर्थन उत्कृष्ट आहे.' },
        { name: 'रमेश व्ही.', text: 'मला गुंतवणूक पर्याय आणि सुरक्षा वैशिष्ट्ये आवडतात.' },
      ],
      securityBadges: [
        { icon: 'fa-shield-alt', label: '256-बिट SSL एनक्रिप्शन' },
        { icon: 'fa-lock', label: '2FA सक्षम' },
        { icon: 'fa-university', label: 'RBI अनुरूप' },
        { icon: 'fa-user-check', label: 'KYC पडताळणी' },
      ],
      learnMore: 'अधिक जाणून घ्या',
      whatUsersSay: 'आमच्या वापरकर्त्यांचे मत',
      close: 'बंद करा',
      moreInfo: 'अधिक माहिती',
      loginForMore: 'अधिक तपशील पाहण्यासाठी मोफत लॉगिन करा.',
      closeBtn: 'बंद करा',
    }
  };
  const t = translations[language] || translations.en;

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '2rem',
        minHeight: '100vh',
        background: `linear-gradient(rgba(246,248,250,0.7), rgba(246,248,250,0.7)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat fixed`,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
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
      {/* Info Modal for Learn More */}
      {showInfoModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div className="modal-dialog" style={{ maxWidth: 400, width: '90%' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  <i className="fas fa-info-circle me-2"></i>
                  {t.moreInfo}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowInfoModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">{t.loginForMore}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowInfoModal(false)}>{t.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner - only show after language is selected */}
      {!showInfoModal && (
        <div className="container mb-5">
          <div className="py-5 px-3 rounded shadow-sm" style={{ maxWidth: 700, margin: '0 auto', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
            <h1 className="arthsetu-welcome mb-2">{t.welcome}</h1>
            <p className="arthsetu-subtitle lead text-muted mb-4">{t.subtitle}</p>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="container mb-5">
        <div className="row g-4 justify-content-center">
          {t.features.map((f, idx) => (
            <div className="col-6 col-md-4 col-lg-2" key={idx}>
              <div className="p-4 bg-white rounded shadow-sm h-100 d-flex flex-column align-items-center justify-content-between">
                <i className={`fas ${f.icon} fa-2x text-primary mb-3`}></i>
                <h6 className="fw-bold mb-1">{f.title}</h6>
                <p className="text-muted small mb-2">{f.desc}</p>
                <button className="btn btn-outline-primary btn-sm mt-auto" style={{ marginTop: 'auto' }} onClick={() => setShowInfoModal(true)}>{t.learnMore}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mb-5">
        <div className="row g-4 justify-content-center">
          {t.stats.map((s, idx) => (
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
        <h4 className="fw-bold text-primary mb-4 text-center">{t.financialVideos}</h4>
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
        <h4 className="fw-bold text-primary mb-4 text-center">{t.testimonialsTitle}</h4>
        <div className="row g-4 justify-content-center">
          {t.testimonials.map((t, idx) => (
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
          {t.securityBadges.map((b, idx) => (
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