import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const translations = {
    en: { home: 'Home', login: 'Login', language: 'Language' },
    hi: { home: 'होम', login: 'लॉगिन', language: 'भाषा' },
    mr: { home: 'मुख्यपृष्ठ', login: 'लॉगिन', language: 'भाषा' }
  };
  const t = translations[language] || translations.en;

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 2rem',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            marginRight: '1.5rem',
            textDecoration: 'none',
            color: '#333',
            fontWeight: 500,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          <i className="fas fa-home"></i> {t.home}
        </Link>
        <Link
          to="/login"
          style={{
            textDecoration: 'none',
            color: '#333',
            fontWeight: 500,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          <i className="fas fa-sign-in-alt"></i> {t.login}
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="fas fa-globe" style={{ fontSize: '1.2rem', color: '#555' }}></i>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          style={{
            padding: '0.3rem 0.8rem',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            background: '#f9f9f9',
            color: '#333',
            outline: 'none',
            cursor: 'pointer',
            transition: 'border 0.2s',
          }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar; 