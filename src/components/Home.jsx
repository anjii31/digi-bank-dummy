import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const { language } = useLanguage();
  const translations = {
    en: {
      welcome: 'Welcome to Digi Bank',
      instruction: 'Please use the Login button in the navigation bar to access your account.'
    },
    hi: {
      welcome: 'Digi Bank में आपका स्वागत है',
      instruction: 'कृपया अपने खाते तक पहुँचने के लिए नेविगेशन बार में लॉगिन बटन का उपयोग करें।'
    },
    mr: {
      welcome: 'Digi Bank मध्ये आपले स्वागत आहे',
      instruction: 'कृपया आपल्या खात्यात प्रवेश करण्यासाठी नेव्हिगेशन बारमधील लॉगिन बटण वापरा.'
    }
  };
  const t = translations[language] || translations.en;
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>{t.welcome}</h1>
      <p>{t.instruction}</p>
    </div>
  );
};

export default Home; 