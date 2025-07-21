import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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

  // Rule-based recommendations
  useEffect(() => {
    if (!profile) return;
    const recs = [];
    
    // User type specific recommendations
    if (profile.userType === 'vendor') {
      recs.push(
        {
          text: 'Track your daily sales and expenses to understand your business better.',
          link: '#',
          why: 'As a vendor, tracking daily transactions helps you identify profitable days and manage cash flow effectively.'
        },
        {
          text: 'Consider digital payment options to increase your customer base.',
          link: '#',
          why: 'Digital payments can attract more customers and provide better transaction records for your business.'
        },
        {
          text: 'Set aside money for business expansion and emergency funds.',
          link: '#',
          why: 'Having separate funds for business growth and emergencies ensures your business can handle unexpected situations.'
        },
        {
          text: 'Learn about small business loans and government schemes.',
          link: '#',
          why: 'There are many government schemes and loan options specifically designed for small vendors and business owners.'
        }
      );
    } else if (profile.userType === 'shg') {
      recs.push(
        {
          text: 'Track group savings and individual contributions regularly.',
          link: '#',
          why: 'Regular tracking helps maintain transparency and ensures all members are contributing as agreed.'
        },
        {
          text: 'Set up group goals for collective financial growth.',
          link: '#',
          why: 'Collective goals can motivate all members and lead to better financial outcomes for the entire group.'
        },
        {
          text: 'Learn about group lending and investment opportunities.',
          link: '#',
          why: 'SHGs can access special loan schemes and investment options that are not available to individuals.'
        },
        {
          text: 'Plan for group business ventures or income-generating activities.',
          link: '#',
          why: 'Group businesses can provide additional income and strengthen the financial position of all members.'
        }
      );
    } else if (profile.userType === 'farmer') {
      recs.push(
        {
          text: 'Track seasonal income and plan for off-season expenses.',
          link: '#',
          why: 'Farming income is seasonal, so planning for off-season expenses is crucial for financial stability.'
        },
        {
          text: 'Learn about agricultural loans and crop insurance.',
          link: '#',
          why: 'Special loan schemes and insurance options are available for farmers to manage risks and expand operations.'
        },
        {
          text: 'Diversify income sources beyond farming.',
          link: '#',
          why: 'Having multiple income sources can provide stability when farming income is low.'
        },
        {
          text: 'Save for agricultural equipment and infrastructure.',
          link: '#',
          why: 'Modern farming equipment can improve productivity and reduce manual labor costs.'
        }
      );
    } else if (profile.userType === 'artisan') {
      recs.push(
        {
          text: 'Track material costs and pricing for better profit margins.',
          link: '#',
          why: 'Understanding your costs helps you price your products correctly and maximize profits.'
        },
        {
          text: 'Explore online platforms to reach more customers.',
          link: '#',
          why: 'Online platforms can help you reach customers beyond your local area and increase sales.'
        },
        {
          text: 'Invest in quality tools and equipment.',
          link: '#',
          why: 'Better tools can improve your work quality and efficiency, leading to higher income.'
        },
        {
          text: 'Learn about artisan-specific government schemes.',
          link: '#',
          why: 'Many government schemes are specifically designed to support artisans and craftspeople.'
        }
      );
    } else if (profile.userType === 'individual') {
      recs.push(
        {
          text: 'Start building an emergency fund for unexpected expenses.',
          link: '#',
          why: 'An emergency fund provides financial security and prevents debt during unexpected situations.'
        },
        {
          text: 'Learn about different savings and investment options.',
          link: '#',
          why: 'Understanding various financial products helps you make informed decisions about your money.'
        },
        {
          text: 'Track your spending to identify areas for saving.',
          link: '#',
          why: 'Understanding where your money goes helps you make better financial decisions.'
        },
        {
          text: 'Plan for major life goals like education, marriage, or home.',
          link: '#',
          why: 'Planning ahead for major expenses helps you save systematically and avoid financial stress.'
        }
      );
    }

    // Financial situation based recommendations
    if (profile.savings && Number(profile.savings) < 5000) {
      recs.push({
        text: 'Start a savings goal to build an emergency fund.',
        link: '#',
        why: 'Your current savings are low. An emergency fund helps you handle unexpected expenses without going into debt.'
      });
    }
    
    if (profile.income && profile.expenses && Number(profile.expenses) > Number(profile.income) * 0.8) {
      recs.push({
        text: 'Your expenses are high relative to income. Consider cost-cutting strategies.',
        link: '#',
        why: 'High expenses can limit your ability to save and invest. Identifying areas to reduce costs can improve your financial health.'
      });
    }
    
    if (profile.income && (!profile.expenses || Number(profile.income) > Number(profile.expenses) * 1.5)) {
      recs.push({
        text: 'You have good income potential. Consider investing your surplus.',
        link: '#',
        why: 'Investing surplus income can help your money grow and provide additional income streams.'
      });
    }

    // Comfort level based recommendations
    if (profile.comfort === 'beginner') {
      recs.push(
        {
          text: 'Start with basic financial education and money management.',
          link: '#',
          why: 'Building a strong foundation in financial basics will help you make better decisions as you progress.'
        },
        {
          text: 'Learn about safe and simple investment options.',
          link: '#',
          why: 'Starting with simple, low-risk investments helps you learn while building wealth safely.'
        }
      );
    } else if (profile.comfort === 'intermediate') {
      recs.push(
        {
          text: 'Explore more advanced investment and business opportunities.',
          link: '#',
          why: 'With your experience, you can consider more sophisticated financial strategies.'
        },
        {
          text: 'Learn about tax planning and financial optimization.',
          link: '#',
          why: 'Understanding tax implications can help you keep more of your hard-earned money.'
        }
      );
    } else if (profile.comfort === 'advanced') {
      recs.push(
        {
          text: 'Consider portfolio diversification and advanced investment strategies.',
          link: '#',
          why: 'With your experience, you can explore complex investment strategies for better returns.'
        },
        {
          text: 'Explore business expansion and entrepreneurial opportunities.',
          link: '#',
          why: 'Your financial knowledge positions you well to start or expand business ventures.'
        }
      );
    }

    // Goal-based recommendations
    if (profile.goals && profile.goals.toLowerCase().includes('expand')) {
      recs.push({
        text: 'Research business expansion funding options and market opportunities.',
        link: '#',
        why: 'Expanding a business requires careful planning and adequate funding to ensure success.'
      });
    }
    
    if (profile.goals && profile.goals.toLowerCase().includes('education')) {
      recs.push({
        text: 'Explore education loans and scholarship opportunities.',
        link: '#',
        why: 'Education is an investment in your future. Understanding funding options can make it more affordable.'
      });
    }
    
    if (profile.goals && profile.goals.toLowerCase().includes('equipment')) {
      recs.push({
        text: 'Look into equipment financing and leasing options.',
        link: '#',
        why: 'Equipment financing can help you acquire necessary tools without depleting your savings.'
      });
    }

    // Default recommendation if no specific ones are generated
    if (recs.length === 0) {
      recs.push({
        text: 'Start tracking your income and expenses to understand your financial situation better.',
        link: '#',
        why: 'Understanding your current financial situation is the first step toward achieving your goals.'
      });
    }

    // Limit to 6 recommendations to avoid overwhelming the user
    setRecommendations(recs.slice(0, 6));
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
                    msg += ` are a ${profile.userType === 'shg' ? 'member of an SHG group' : profile.userType}`;
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