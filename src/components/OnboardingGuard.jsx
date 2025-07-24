import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const OnboardingGuard = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const checkOnboarding = async () => {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || !docSnap.data().onboardingComplete) {
        navigate('/onboarding');
      } else {
        setLoading(false);
      }
    };
    checkOnboarding();
  }, [currentUser, navigate]);

  if (loading) return null;
  return children;
};

export default OnboardingGuard; 