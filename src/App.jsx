import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import Onboarding from './components/Onboarding';
import WelcomeScreen from './components/WelcomeScreen';
import GroupSavingsTracker from './components/GroupSavingsTracker';
import Navbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Placeholder for Home component (to be created)
import Home from './components/Home';
import OnboardingGuard from './components/OnboardingGuard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/group-savings" element={<GroupSavingsTracker />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <OnboardingGuard>
                  <Dashboard />
                </OnboardingGuard>
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
