import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { language } = useLanguage();
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

  const translations = {
    en: {
      complete: 'Complete Your Profile',
      step: 'Step',
      of: 'of',
      profileSaved: 'Profile saved! Redirecting...',
      profileUpdated: 'Profile updated! Redirecting...',
      goDashboard: 'Go to Dashboard',
      userType: 'What type of user are you?',
      chooseType: 'Choose your type...',
      individual: 'Individual',
      shg: 'SHG Group Member',
      vendor: 'Small Vendor/Business Owner',
      artisan: 'Artisan/Craftsman',
      farmer: 'Farmer',
      other: 'Other',
      help: 'This helps us provide personalized recommendations for your financial journey.'
    },
    hi: {
      complete: 'अपनी प्रोफ़ाइल पूरी करें',
      step: 'चरण',
      of: 'में से',
      profileSaved: 'प्रोफ़ाइल सहेजी गई! पुनः निर्देशित किया जा रहा है...',
      profileUpdated: 'प्रोफ़ाइल अपडेट की गई! पुनः निर्देशित किया जा रहा है...',
      goDashboard: 'डैशबोर्ड पर जाएं',
      userType: 'आप किस प्रकार के उपयोगकर्ता हैं?',
      chooseType: 'अपना प्रकार चुनें...',
      individual: 'व्यक्ति',
      shg: 'SHG समूह सदस्य',
      vendor: 'छोटे विक्रेता/व्यवसाय मालिक',
      artisan: 'कारीगर/शिल्पकार',
      farmer: 'किसान',
      other: 'अन्य',
      help: 'यह हमें आपकी वित्तीय यात्रा के लिए व्यक्तिगत अनुशंसाएँ प्रदान करने में मदद करता है।'
    },
    mr: {
      complete: 'तुमची प्रोफाइल पूर्ण करा',
      step: 'पायरी',
      of: 'पैकी',
      profileSaved: 'प्रोफाइल जतन केली! पुनर्निर्देशित केले जात आहे...',
      profileUpdated: 'प्रोफाइल अपडेट केली! पुनर्निर्देशित केले जात आहे...',
      goDashboard: 'डॅशबोर्डकडे जा',
      userType: 'आपण कोणत्या प्रकारचे वापरकर्ता आहात?',
      chooseType: 'तुमचा प्रकार निवडा...',
      individual: 'वैयक्तिक',
      shg: 'SHG गट सदस्य',
      vendor: 'लहान विक्रेता/व्यवसाय मालक',
      artisan: 'कारागीर/शिल्पकार',
      farmer: 'शेतकरी',
      other: 'इतर',
      help: 'हे आम्हाला तुमच्या आर्थिक प्रवासासाठी वैयक्तिकृत शिफारसी देण्यास मदत करते.'
    }
  };
  const t = translations[language] || translations.en;

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
      // If already had a profile, show 'Profile updated!', else show 'Profile saved!'
      const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (docSnap.exists()) {
        setUpdated(true);
      } else {
        setSuccess(true);
      }
      setTimeout(() => navigate('/welcome'), 1200);
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

  return (
    <div className="container py-5" style={{maxWidth: 600}}>
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-primary mb-3">
          <i className="fas fa-user-plus me-2"></i>
          {t.complete}
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
            <i className={steps[step].icon}></i> {t.step} {step + 1} {t.of} {steps.length}: {steps[step].name}
          </span>
        </div>
        <p className="text-muted">{steps[step].description}</p>
      </div>
      
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && (
        <div className="text-center my-4">
          <div className="alert alert-success" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {t.profileSaved}
          </div>
          <button className="btn btn-success btn-lg px-5 fw-bold mt-3" onClick={() => navigate('/dashboard')}>
            {t.goDashboard} <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      )}
      {updated && (
        <div className="text-center my-4">
          <div className="alert alert-info" role="alert">
            <i className="fas fa-sync-alt me-2"></i>
            {t.profileUpdated}
          </div>
          <button className="btn btn-success btn-lg px-5 fw-bold mt-3" onClick={() => navigate('/dashboard')}>
            {t.goDashboard} <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      )}
      
      <div className="card p-5 mb-4 shadow-sm border-0" data-step={step}>
        {step === 0 && (
          <div>
            <label htmlFor="userType" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-user me-2 text-primary"></i>
              {t.userType}
            </label>
            <select 
              className="form-select form-select-lg" 
              value={profile.userType} 
              onChange={e => handleChange('userType', e.target.value)}
              onKeyPress={handleKeyPress}
              id="userType"
              aria-describedby="userTypeHelp"
            >
              <option value="">{t.chooseType}</option>
              <option value="individual">{t.individual}</option>
              <option value="shg">{t.shg}</option>
              <option value="vendor">{t.vendor}</option>
              <option value="artisan">{t.artisan}</option>
              <option value="farmer">{t.farmer}</option>
              <option value="other">{t.other}</option>
            </select>
            <div id="userTypeHelp" className="form-text">
              {t.help}
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
          {t.goDashboard} <i className="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}

export default Onboarding; 