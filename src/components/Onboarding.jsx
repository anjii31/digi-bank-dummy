import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const steps = [
  { name: 'Basic Info', icon: 'fas fa-user' }, // state, user type, age, gender
  { name: 'Financial Info', icon: 'fas fa-money-bill-wave' }, // income, expenses, goals, comfort
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

// Add Indian states array
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
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
  // Update profile state to include new fields and remove savings/old expenses
  const [profile, setProfile] = useState({
    state: '',
    userType: '',
    age: '',
    gender: '',
    goals: '',
    bplCategory: '',
    income: '',
    savings: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [showGoalSuggestions, setShowGoalSuggestions] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
      const filteredProfile = {
        state: profile.state,
        userType: profile.userType,
        age: profile.age,
        gender: profile.gender,
        goals: profile.goals,
        bplCategory: profile.bplCategory,
        income: profile.income,
        savings: profile.savings,
      };
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
            <label htmlFor="state" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-map-marker-alt me-2 text-primary"></i>
              Which state do you live in?
            </label>
            <select
              className="form-select form-select-lg mb-3"
              value={profile.state}
              onChange={e => handleChange('state', e.target.value)}
              id="state"
              required
            >
              <option value="">Select your state...</option>
              {indianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <label htmlFor="userType" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-user me-2 text-primary"></i>
              What type of user are you?
            </label>
            <select
              className="form-select form-select-lg mb-3"
              value={profile.userType}
              onChange={e => handleChange('userType', e.target.value)}
              id="userType"
              required
            >
              <option value="">Choose your type...</option>
              <option value="individual">Individual</option>
              <option value="vendor">Micro and small entrepreneurs</option>
              <option value="community">Community helpers</option>
              <option value="farmer">Farmer</option>
              <option value="other">Other</option>
            </select>

            <label htmlFor="age" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-birthday-cake me-2 text-primary"></i>
              What is your age?
            </label>
            <input
              type="number"
              className="form-control form-control-lg mb-3"
              value={profile.age}
              onChange={e => handleChange('age', e.target.value)}
              id="age"
              min="10"
              max="120"
              required
            />

            <label htmlFor="gender" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-venus-mars me-2 text-primary"></i>
              What is your gender?
            </label>
            <select
              className="form-select form-select-lg mb-3"
              value={profile.gender}
              onChange={e => handleChange('gender', e.target.value)}
              id="gender"
              required
            >
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        
        {step === 1 && (
          <div>
            <label htmlFor="goals" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-bullseye me-2 text-primary"></i>
              What are your main financial goals?
            </label>
            <input
              className="form-control form-control-lg mb-3"
              value={profile.goals}
              onChange={e => handleChange('goals', e.target.value)}
              id="goals"
              required
            />

            <label htmlFor="income" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-money-bill-wave me-2 text-primary"></i>
              What is your average monthly income?
            </label>
            <input
              type="number"
              className="form-control form-control-lg mb-3"
              value={profile.income}
              onChange={e => handleChange('income', e.target.value)}
              id="income"
              min="0"
              required
            />
            <label htmlFor="savings" className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-piggy-bank me-2 text-primary"></i>
              What are your average monthly savings?
            </label>
            <input
              type="number"
              className="form-control form-control-lg mb-3"
              value={profile.savings}
              onChange={e => handleChange('savings', e.target.value)}
              id="savings"
              min="0"
              required
            />

            <label className="form-label fw-semibold text-dark mb-3">
              <i className="fas fa-id-card me-2 text-primary"></i>
              Do you belong to BPL category?
            </label>
            <div className="mb-3 d-flex gap-4 align-items-center justify-content-start">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="bplCategory"
                  id="bplYes"
                  value="yes"
                  checked={profile.bplCategory === 'yes'}
                  onChange={e => handleChange('bplCategory', e.target.value)}
                />
                <label className="form-check-label" htmlFor="bplYes">Yes</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="bplCategory"
                  id="bplNo"
                  value="no"
                  checked={profile.bplCategory === 'no'}
                  onChange={e => handleChange('bplCategory', e.target.value)}
                />
                <label className="form-check-label" htmlFor="bplNo">No</label>
              </div>
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