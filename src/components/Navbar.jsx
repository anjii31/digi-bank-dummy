import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export let navbarLanguage = 'en';
export let setNavbarLanguage = () => {};

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', query: '' });
  const [requestId, setRequestId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  navbarLanguage = language;
  setNavbarLanguage = setLanguage;

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // Optionally, trigger a callback or context update here
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Generate random 6-digit request ID
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    setRequestId(id);
    setShowModal(false);
    setShowSuccess(true);
    // Optionally, send form data to backend here
    setForm({ name: '', phone: '', address: '', query: '' });
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setRequestId(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const translations = {
    en: {
      home: 'Home',
      financeDoorstep: 'Finance at Your Doorstep',
      login: 'Login',
      logout: 'Logout',
      name: 'Name',
      phone: 'Phone Number',
      address: 'Address',
      query: 'Query',
      submit: 'Submit',
      requestSubmitted: 'Request Submitted!',
      requestReceived: 'Your request has been received. Our representative will contact you soon.',
      requestId: 'Your Request ID:',
      close: 'Close',
      selectLanguage: 'Select Language',
      english: 'English',
      hindi: 'Hindi',
      marathi: 'Marathi',
      dashboard: 'Dashboard',
      namePlaceholder: 'Enter your name',
      phonePlaceholder: 'Enter your phone number',
      addressPlaceholder: 'Enter your address',
      queryPlaceholder: 'Enter your query',
      user: 'User',
    },
    hi: {
      home: 'होम',
      financeDoorstep: 'आपके द्वार वित्त',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      name: 'नाम',
      phone: 'फ़ोन नंबर',
      address: 'पता',
      query: 'प्रश्न',
      submit: 'सबमिट करें',
      requestSubmitted: 'अनुरोध सबमिट हुआ!',
      requestReceived: 'आपका अनुरोध प्राप्त हो गया है। हमारा प्रतिनिधि आपसे शीघ्र संपर्क करेगा।',
      requestId: 'आपका अनुरोध आईडी:',
      close: 'बंद करें',
      selectLanguage: 'भाषा चुनें',
      english: 'अंग्रेज़ी',
      hindi: 'हिन्दी',
      marathi: 'मराठी',
      dashboard: 'डॅशबोर्ड',
      namePlaceholder: 'अपना नाम दर्ज करें',
      phonePlaceholder: 'अपना फ़ोन नंबर दर्ज करें',
      addressPlaceholder: 'अपना पता दर्ज करें',
      queryPlaceholder: 'अपना प्रश्न दर्ज करें',
      user: 'उपयोगकर्ता',
    },
    mr: {
      home: 'मुख्यपृष्ठ',
      financeDoorstep: 'आपल्या दारात वित्त',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      name: 'नाव',
      phone: 'फोन नंबर',
      address: 'पत्ता',
      query: 'प्रश्न',
      submit: 'सबमिट करा',
      requestSubmitted: 'विनंती सबमिट झाली!',
      requestReceived: 'आपली विनंती प्राप्त झाली आहे. आमचा प्रतिनिधी लवकरच आपल्याशी संपर्क साधेल.',
      requestId: 'आपली विनंती आयडी:',
      close: 'बंद करा',
      selectLanguage: 'भाषा निवडा',
      english: 'इंग्रजी',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      dashboard: 'डॅशबोर्ड',
      namePlaceholder: 'तुमचे नाव प्रविष्ट करा',
      phonePlaceholder: 'तुमचा फोन नंबर प्रविष्ट करा',
      addressPlaceholder: 'तुमचा पत्ता प्रविष्ट करा',
      queryPlaceholder: 'तुमचा प्रश्न प्रविष्ट करा',
      user: 'वापरकर्ता',
    }
  };
  const t = translations[language] || translations.en;

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 2rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <style>{`
        .cloud-animate {
          animation: cloud-float 2.5s ease-in-out infinite alternate, cloud-glow 2.5s ease-in-out infinite alternate;
          background: linear-gradient(90deg, #e3f0fc 60%, #f8fbff 100%);
          border-radius: 12px;
          box-shadow: 0 0 16px 2px #90caf9cc;
          transition: box-shadow 0.3s, background 0.3s;
        }
        @keyframes cloud-float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes cloud-glow {
          0% { box-shadow: 0 0 16px 2px #90caf9cc; }
          50% { box-shadow: 0 0 32px 8px #bbdefbcc; }
          100% { box-shadow: 0 0 16px 2px #90caf9cc; }
        }
        .bomb-animate {
          animation: bomb-pulse 1.2s infinite, bomb-shake 0.4s infinite alternate;
          background: radial-gradient(circle, #fffde7 60%, #ff5252 100%);
          border-radius: 8px;
          box-shadow: 0 0 16px 2px #ff525288;
          transition: box-shadow 0.3s, background 0.3s;
        }
        @keyframes bomb-pulse {
          0% { box-shadow: 0 0 0 0 #ff525288; }
          70% { box-shadow: 0 0 0 12px rgba(255,82,82,0); }
          100% { box-shadow: 0 0 0 0 #ff525288; }
        }
        @keyframes bomb-shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-2px) rotate(-2deg); }
          40% { transform: translateX(2px) rotate(2deg); }
          60% { transform: translateX(-2px) rotate(-2deg); }
          80% { transform: translateX(2px) rotate(2deg); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
          <i className="fas fa-home"></i> {t.home}
        </Link>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
          <i className="fas fa-tachometer-alt"></i> {t.dashboard || 'Dashboard'}
        </Link>
        <button type="button" className="btn btn-link p-0 bomb-animate" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s', padding: '0.2rem 0.7rem' }} onClick={() => setShowModal(true)}>
          <i className="fas fa-user-headset"></i> {t.financeDoorstep}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <i className="fas fa-globe" style={{ fontSize: '1.2rem', color: '#555' }}></i>
        <select id="language-select" value={language} onChange={handleLanguageChange} style={{ padding: '0.3rem 0.8rem', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', background: '#f9f9f9', color: '#333', outline: 'none', cursor: 'pointer', transition: 'border 0.2s' }}>
          <option value="en">{t.english}</option>
          <option value="hi">{t.hindi}</option>
          <option value="mr">{t.marathi}</option>
        </select>
        {!currentUser && (
          <Link to="/login" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
            <i className="fas fa-sign-in-alt"></i> {t.login}
          </Link>
        )}
        {currentUser && (
          <span style={{ marginLeft: 8, fontWeight: 500 }}>
            {t.user}: {currentUser.displayName || currentUser.email}
          </span>
        )}
        {currentUser && (
          <button onClick={handleLogout} className="btn btn-link p-0" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
            <i className="fas fa-sign-out-alt"></i> {t.logout}
          </button>
        )}
      </div>
      {/* Modal for Request Bank Representative */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card shadow-lg" style={{ minWidth: 340, maxWidth: 400, width: '90%' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary"><i className="fas fa-user-headset me-2"></i>Finance at Your Doorstep</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label className="form-label">{t.name}</label>
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleFormChange} required placeholder={t.namePlaceholder} />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t.phone}</label>
                  <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleFormChange} pattern="[0-9]{10}" required placeholder={t.phonePlaceholder} />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t.address}</label>
                  <input type="text" className="form-control" name="address" value={form.address} onChange={handleFormChange} required placeholder={t.addressPlaceholder} />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t.query}</label>
                  <textarea className="form-control" name="query" value={form.query} onChange={handleFormChange} rows={3} required placeholder={t.queryPlaceholder}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">{t.submit}</button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal for Request ID */}
      {showSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card shadow-lg" style={{ minWidth: 340, maxWidth: 400, width: '90%' }}>
            <div className="card-body p-4 text-center">
              <h5 className="mb-3 text-success"><i className="fas fa-check-circle me-2"></i>{t.requestSubmitted}</h5>
              <p className="mb-2">{t.requestReceived}</p>
              <div className="alert alert-info mb-3">{t.requestId} <b>{requestId}</b></div>
              <button className="btn btn-primary w-100" onClick={handleCloseSuccess}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 