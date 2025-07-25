import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export let navbarLanguage = 'en';
export let setNavbarLanguage = () => {};

const Navbar = () => {
  const [language, setLanguage] = useState('en');
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
          <i className="fas fa-home"></i> Home
        </Link>
        <button type="button" className="btn btn-link p-0 bomb-animate" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s', padding: '0.2rem 0.7rem' }} onClick={() => setShowModal(true)}>
          <i className="fas fa-user-headset"></i> Finance at Your Doorstep
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <i className="fas fa-globe" style={{ fontSize: '1.2rem', color: '#555' }}></i>
        <select id="language-select" value={language} onChange={handleLanguageChange} style={{ padding: '0.3rem 0.8rem', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', background: '#f9f9f9', color: '#333', outline: 'none', cursor: 'pointer', transition: 'border 0.2s' }}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
        {!currentUser && (
          <Link to="/login" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        )}
        {currentUser && (
          <button onClick={handleLogout} className="btn btn-link p-0" style={{ textDecoration: 'none', color: '#333', fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
            <i className="fas fa-sign-out-alt"></i> Logout
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
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleFormChange} pattern="[0-9]{10}" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" name="address" value={form.address} onChange={handleFormChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Query</label>
                  <textarea className="form-control" name="query" value={form.query} onChange={handleFormChange} rows={3} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">Submit</button>
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
              <h5 className="mb-3 text-success"><i className="fas fa-check-circle me-2"></i>Request Submitted!</h5>
              <p className="mb-2">Your request has been received. Our representative will contact you soon.</p>
              <div className="alert alert-info mb-3">Your Request ID: <b>{requestId}</b></div>
              <button className="btn btn-primary w-100" onClick={handleCloseSuccess}>Close</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 