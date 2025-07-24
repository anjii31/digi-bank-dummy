import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getRecommendationsForUser } from '../services/recommendationService';

function WelcomeScreen() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [showExplanation, setShowExplanation] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [currentUser]);

  // ML-based recommendations
  useEffect(() => {
    if (!profile) return;
    const recs = [];

    if (profile.userType === 'individual') {
      recs.push({
        text: 'Explore personal finance tips and budgeting tools.',
        link: '#',
        why: 'As an individual, managing your personal finances is key to achieving your goals.'
      });
    }
    if (profile.userType === 'Micro and small entrepreneurs' || profile.userType === 'vendor') {
      recs.push({
        text: 'Check out our resources for micro and small businesses.',
        link: '#',
        why: 'Entrepreneurs and vendors can benefit from business planning and digital payment solutions.'
      });
    }
    if (profile.userType === 'communityHelper') {
      recs.push({
        text: 'Learn about group savings and community support programs.',
        link: '#',
        why: 'Community helpers can leverage collective financial tools for greater impact.'
      });
    }
    if (profile.userType === 'farmer') {
      recs.push({
        text: 'Access agricultural finance and crop insurance guides.',
        link: '#',
        why: 'Farmers can benefit from specialized financial products and government schemes.'
      });
    }
    if (profile.userType === 'other') {
      recs.push({
        text: 'Discover our full range of financial guidance resources.',
        link: '#',
        why: 'We offer support for a variety of financial needs and backgrounds.'
      });
    }

    if (recs.length === 0) {
      recs.push({
        text: 'Start tracking your income and expenses to understand your financial situation better.',
        link: '#',
        why: 'Understanding your current financial situation is the first step toward achieving your goals.'
      });
    }
    setRecommendations(recs);
  }, [profile]);

  return (
    <div className="container py-5" style={{maxWidth: 700}}>
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary mb-2">Welcome to DigiBank!</h2>
        <p className="lead text-muted">We're excited to help you on your financial journey.</p>
      </div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center py-4">
              <span className="spinner-border text-primary me-2"></span>
              <span>Loading your profile...</span>
            </div>
          ) : profile ? (
            <>
              <h4 className="mb-3 text-success">Your Profile Summary</h4>
              <div className="alert alert-info mb-4 text-dark fs-5" style={{background: 'rgba(0,123,255,0.07)'}}>
                {(() => {
                  let msg = 'I see that you';
                  if (profile.userType) {
                    msg += ` are a ${profile.userType === 'individual' ? 'self-employed individual' : profile.userType}`;
                  }
                  if (profile.comfort) {
                    msg += ` and your comfort with financial concepts is "${profile.comfort}"`;
                  }
                  if (profile.income) {
                    msg += `, with a monthly income of ₹${profile.income}`;
                  }
                  if (profile.expenses) {
                    msg += ` and monthly expenses of ₹${profile.expenses}`;
                  }
                  if (profile.savings) {
                    msg += `, and you currently have savings of ₹${profile.savings}`;
                  }
                  if (profile.goals) {
                    msg += `. Your goal is: "${profile.goals}"`;
                  }
                  msg += '. Let\'s help you go beyond that!';
                  return msg;
                })()}
              </div>
              <h5 className="mb-3 text-primary">Recommended for You</h5>
              <div className="row g-3 mb-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 bg-light">
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h6 className="card-title text-primary mb-2">{rec.text}</h6>
                          <div className="d-flex align-items-center mb-3">
                            <button 
                              type="button" 
                              className="btn btn-link p-0 text-info me-2" 
                              onClick={() => setShowExplanation(rec.why)}
                              style={{textDecoration: 'none'}}
                              aria-label="Learn more about this recommendation"
                            >
                              <i className="fas fa-info-circle"></i>
                            </button>
                            <span className="small text-muted">Why this?</span>
                          </div>
                        </div>
                        {/* Action button for SHG group savings tracker */}
                        {rec.text.includes('Track group savings') ? (
                          <button className="btn btn-primary mt-auto" onClick={() => navigate('/group-savings')}>
                            Go to Group Savings Tracker
                          </button>
                        ) : (
                          <a href={rec.link} className="btn btn-outline-primary mt-auto" target="_blank" rel="noopener noreferrer">
                            Learn More
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button className="btn btn-success btn-lg px-5 fw-bold" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="alert alert-warning mb-0">No profile data found. Please complete onboarding.</div>
          )}
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="card shadow-lg" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Why This Recommendation?
              </h5>
              <button 
                className="btn btn-link text-white p-0"
                onClick={() => setShowExplanation(null)}
                aria-label="Close explanation"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body">
              <p className="mb-0">{showExplanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen; 