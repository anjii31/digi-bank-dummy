import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const steps = [
  { name: 'User Type', icon: 'fas fa-user', description: 'Tell us about yourself' },
  { name: 'Goals', icon: 'fas fa-bullseye', description: 'What do you want to achieve?' },
  { name: 'Income', icon: 'fas fa-money-bill-wave', description: 'Your monthly income' },
  { name: 'Expenses', icon: 'fas fa-shopping-cart', description: 'Your monthly expenses' },
  { name: 'Savings', icon: 'fas fa-piggy-bank', description: 'Current savings' },
  { name: 'Financial Comfort', icon: 'fas fa-graduation-cap', description: 'Your experience level' },
];

const goalSuggestions = [
  'Build emergency fund',
  'Expand my business',
  'Save for education',
  'Buy equipment/machinery',
  'Start a new business',
  'Pay off debts',
  'Save for family needs',
  'Invest for future'
];

const incomeCategories = [
  'Business/Sales',
  'Salary/Wages',
  'Freelance/Contract',
  'Agriculture/Farming',
  'Handicrafts/Artisan',
  'Services (Repair, Beauty, etc.)',
  'Other'
];

const expenseCategories = [
  'Food & Groceries',
  'Transportation',
  'Rent/Home',
  'Utilities (Electricity, Water)',
  'Healthcare',
  'Education',
  'Business Expenses',
  'Entertainment',
  'Other'
];

const initialProfile = {
  userType: '',
  goals: '',
  income: '',
  expenses: '',
  savings: '',
  comfort: '',
};

function Onboarding() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [showGoalSuggestions, setShowGoalSuggestions] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Language selection state
  const [language, setLanguage] = useState('');
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

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

  // Speech recognition for language selection
  const handleSpeakLanguage = () => {
    setSpeechError('');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      setListening(false);
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes('english')) {
        setLanguage('en');
      } else if (transcript.includes('hindi') || transcript.includes('हिंदी')) {
        setLanguage('hi');
      } else if (transcript.includes('marathi') || transcript.includes('मराठी')) {
        setLanguage('mr');
      } else {
        setSpeechError('Could not recognize the language. Please try again.');
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      setSpeechError('Speech recognition error: ' + event.error);
    };
    recognition.onend = () => {
      setListening(false);
    };
  };

  // Prefill onboarding form with existing profile
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      setFetching(true);
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        // ignore
      }
      setFetching(false);
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [currentUser]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
      // Focus on first input of next step
      setTimeout(() => {
        const firstInput = document.querySelector(`[data-step="${step + 1}"] input, [data-step="${step + 1}"] select`);
        if (firstInput) firstInput.focus();
      }, 100);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1);
      // Focus on first input of previous step
      setTimeout(() => {
        const firstInput = document.querySelector(`[data-step="${step - 1}"] input, [data-step="${step - 1}"] select`);
        if (firstInput) firstInput.focus();
      }, 100);
    }
  };

  const handleFinish = async () => {
    if (!currentUser) {
      setError('You must be logged in to complete onboarding.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    setUpdated(false);
    try {
      // Only update fields that are not empty
      const filteredProfile = Object.fromEntries(
        Object.entries(profile).filter(([_, v]) => v !== '' && v !== undefined)
      );
      await setDoc(doc(db, 'users', currentUser.uid), filteredProfile, { merge: true });
      await updateDoc(doc(db, 'users', currentUser.uid), { onboardingComplete: true });
      // If already had a profile, show 'Profile updated!', else show 'Profile saved!'
      const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (docSnap.exists()) {
        setUpdated(true);
      } else {
        setSuccess(true);
      }
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && step < steps.length - 1) {
      nextStep();
    }
  };

  if (fetching) {
    return (
      <div className="container py-5 text-center">
        <span className="spinner-border text-primary me-2"></span>
        <span>Loading your profile...</span>
      </div>
    );
  }

  // Language selection UI
  if (!language) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 400 }}>
        <h2 className="fw-bold text-primary mb-4">
          <i className="fas fa-language me-2"></i>
          Select Your Language
        </h2>
        <p className="mb-4">Please select your language:</p>
        <div className="d-flex flex-column gap-3 align-items-center">
          <button className="btn btn-outline-primary btn-lg w-100" onClick={() => setLanguage('en')}>English</button>
          <button className="btn btn-outline-primary btn-lg w-100" onClick={() => setLanguage('hi')}>हिन्दी (Hindi)</button>
          <button className="btn btn-outline-primary btn-lg w-100" onClick={() => setLanguage('mr')}>मराठी (Marathi)</button>
          <button className="btn btn-outline-secondary btn-lg w-100 mt-3 d-flex align-items-center justify-content-center" onClick={handleSpeakLanguage} disabled={listening}>
            <i className={`fas fa-microphone${listening ? '-alt' : ''} me-2`}></i>
            {listening ? 'Listening...' : 'Speak Now'}
          </button>
          {speechError && <div className="alert alert-danger mt-3" role="alert">{speechError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{maxWidth: 600}}>
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-primary mb-3">
          <i className="fas fa-user-plus me-2"></i>
          Complete Your Profile
        </h2>
        <div className="progress my-4" style={{height: '10px'}}>
          <div 
            className="progress-bar bg-primary" 
            role="progressbar" 
            style={{width: `${((step+1)/steps.length)*100}%`}} 
            aria-valuenow={(step+1)} 
            aria-valuemin={1} 
            aria-valuemax={steps.length}
          ></div>
        </div>
        <div className="d-flex justify-content-between small text-muted mb-3">
          {steps.map((s, i) => (
            <div key={s.name} className="d-flex flex-column align-items-center">
              <i className={`${s.icon} ${i === step ? 'text-primary' : 'text-muted'} mb-1`}></i>
              <span className={i === step ? 'fw-bold text-primary' : ''}>{i+1}</span>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <span className="badge bg-primary bg-opacity-10 text-primary px-4 py-2 fs-6">
            <i className={steps[step].icon}></i> Step {step + 1} of {steps.length}: {steps[step].name}
          </span>
        </div>
        <p className="text-muted">{steps[step].description}</p>
      </div>
      
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && (
        <div className="text-center my-4">
          <div className="alert alert-success" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            Profile saved! Redirecting...
          </div>
          <button className="btn btn-success btn-lg px-5 fw-bold mt-3" onClick={() => navigate('/dashboard')}>
            Go to Dashboard <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      )}
      {updated && (
        <div className="text-center my-4">
          <div className="alert alert-info" role="alert">
            <i className="fas fa-sync-alt me-2"></i>
            Profile updated! Redirecting...
          </div>
          <button className="btn btn-success btn-lg px-5 fw-bold mt-3" onClick={() => navigate('/dashboard')}>
            Go to Dashboard <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      )}
      
      <div className="card p-5 mb-4 shadow-sm border-0" data-step={step}>
        {step === 0 && (
          <div>
            <label htmlFor="userType" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-user me-2 text-primary"></i>
              What type of user are you?
            </label>
            <select 
              className="form-select form-select-lg" 
              value={profile.userType} 
              onChange={e => handleChange('userType', e.target.value)}
              onKeyPress={handleKeyPress}
              id="userType"
              aria-describedby="userTypeHelp"
            >
              <option value="">Choose your type...</option>
              <option value="individual">Individual</option>
              <option value="shg">SHG Group Member</option>
              <option value="vendor">Small Vendor/Business Owner</option>
              <option value="artisan">Artisan/Craftsman</option>
              <option value="farmer">Farmer</option>
              <option value="other">Other</option>
            </select>
            <div id="userTypeHelp" className="form-text">
              This helps us provide personalized recommendations for your financial journey.
            </div>
          </div>
        )}
        
        {step === 1 && (
          <div>
            <label htmlFor="goals" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-bullseye me-2 text-primary"></i>
              What are your main financial goals?
            </label>
            <div className="mb-3">
              <input 
                className="form-control form-control-lg" 
                value={profile.goals} 
                onChange={e => handleChange('goals', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Save for new equipment, expand my business..."
                id="goals"
                aria-describedby="goalsHelp"
              />
            </div>
            <div className="mb-3">
              <button 
                type="button" 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowGoalSuggestions(!showGoalSuggestions)}
                aria-expanded={showGoalSuggestions}
              >
                <i className="fas fa-lightbulb me-2"></i>
                {showGoalSuggestions ? 'Hide' : 'Show'} Goal Suggestions
              </button>
            </div>
            {showGoalSuggestions && (
              <div className="row g-2 mb-3">
                {goalSuggestions.map((goal, idx) => (
                  <div key={idx} className="col-md-6">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary w-100 text-start"
                      onClick={() => handleChange('goals', goal)}
                    >
                      {goal}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div id="goalsHelp" className="form-text">
              Be specific about what you want to achieve financially.
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <label htmlFor="income" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-money-bill-wave me-2 text-primary"></i>
              What is your average monthly income?
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text">₹</span>
              <input 
                type="number" 
                className="form-control" 
                value={profile.income} 
                onChange={e => handleChange('income', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 15000"
                id="income"
                aria-describedby="incomeHelp"
              />
            </div>
            <div className="mt-3">
              <label className="form-label fw-semibold text-dark mb-2">Income Source (Optional):</label>
              <select 
                className="form-select"
                onChange={e => handleChange('incomeSource', e.target.value)}
                value={profile.incomeSource || ''}
              >
                <option value="">Select income source...</option>
                {incomeCategories.map((category, idx) => (
                  <option key={idx} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div id="incomeHelp" className="form-text">
              This helps us understand your financial situation better.
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <label htmlFor="expenses" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-shopping-cart me-2 text-primary"></i>
              What are your average monthly expenses?
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text">₹</span>
              <input 
                type="number" 
                className="form-control" 
                value={profile.expenses} 
                onChange={e => handleChange('expenses', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 12000"
                id="expenses"
                aria-describedby="expensesHelp"
              />
            </div>
            <div className="mt-3">
              <label className="form-label fw-semibold text-dark mb-2">Main Expense Categories (Optional):</label>
              <select 
                className="form-select"
                onChange={e => handleChange('expenseCategory', e.target.value)}
                value={profile.expenseCategory || ''}
              >
                <option value="">Select main expense category...</option>
                {expenseCategories.map((category, idx) => (
                  <option key={idx} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div id="expensesHelp" className="form-text">
              Include all regular expenses like food, transport, utilities, etc.
            </div>
          </div>
        )}
        
        {step === 4 && (
          <div>
            <label htmlFor="savings" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-piggy-bank me-2 text-primary"></i>
              How much do you currently have in savings?
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text">₹</span>
              <input 
                type="number" 
                className="form-control" 
                value={profile.savings} 
                onChange={e => handleChange('savings', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 5000"
                id="savings"
                aria-describedby="savingsHelp"
              />
            </div>
            <div id="savingsHelp" className="form-text">
              This includes cash, bank savings, and any other liquid assets.
            </div>
          </div>
        )}
        
        {step === 5 && (
          <div>
            <label htmlFor="comfort" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-graduation-cap me-2 text-primary"></i>
              How comfortable are you with financial concepts?
            </label>
            <select 
              className="form-select form-select-lg" 
              value={profile.comfort} 
              onChange={e => handleChange('comfort', e.target.value)}
              onKeyPress={handleKeyPress}
              id="comfort"
              aria-describedby="comfortHelp"
            >
              <option value="">Select your comfort level...</option>
              <option value="beginner">Beginner - I'm new to financial planning</option>
              <option value="intermediate">Intermediate - I know some basics</option>
              <option value="advanced">Advanced - I'm experienced with finances</option>
            </select>
            <div id="comfortHelp" className="form-text">
              This helps us provide appropriate guidance and education materials.
            </div>
          </div>
        )}
      </div>
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-outline-secondary px-4" 
          onClick={prevStep} 
          disabled={step === 0 || loading}
          aria-label="Go to previous step"
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back
        </button>
        {step < steps.length - 1 ? (
          <button 
            className="btn btn-primary px-4" 
            onClick={nextStep} 
            disabled={loading}
            aria-label="Go to next step"
          >
            Next
            <i className="fas fa-arrow-right ms-2"></i>
          </button>
        ) : (
          <button 
            className="btn btn-success px-4" 
            onClick={handleFinish} 
            disabled={loading}
            aria-label="Complete onboarding"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Complete Profile
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="text-center mt-4">
        <button 
          className="btn btn-outline-secondary px-5 fw-bold" 
          onClick={() => navigate('/dashboard')}
          aria-label="Go to dashboard"
        >
          Go to Dashboard <i className="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}

export default Onboarding; 