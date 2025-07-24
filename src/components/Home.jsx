<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useRef } from 'react';

const Home = () => {
  // Language selection state
  const [language, setLanguage] = useState('');
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const autoRestartRef = useRef(true);

  // Play TTS prompt for language selection
  useEffect(() => {
    if (!language) {
      const synth = window.speechSynthesis;
      if (synth) {
        const utter = new window.SpeechSynthesisUtterance(
          'Please select your language: English, Hindi, or Marathi.'
        );
        utter.lang = 'en-IN';
        synth.cancel(); // Stop any previous speech
        synth.speak(utter);
      }
    }
  }, [language]);

  // Start speech recognition automatically
  useEffect(() => {
    if (language) {
      // Stop recognition if language is set
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      setListening(false);
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
    // Cleanup on unmount
    return () => {
      autoRestartRef.current = false;
      recognition.onend = null;
      recognition.stop();
    };
  }, [language]);

  // If user clicks a button, stop listening
  const handleSetLanguage = (lang) => {
    autoRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    setLanguage(lang);
  };

  if (!language) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 className="fw-bold text-primary mb-4">
          <i className="fas fa-language me-2"></i>
          Select Your Language
        </h2>
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
    );
  }

>>>>>>> c97d56c0b8532af1c37cd23d38c49fd747fbcef0
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>{t.welcome}</h1>
      <p>{t.instruction}</p>
    </div>
  );
};

export default Home; 