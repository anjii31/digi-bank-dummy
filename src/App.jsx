import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Home from './components/Home';
import Chatbot from './components/Chatbot';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import OnboardingGuard from './components/OnboardingGuard';
import InvestmentPlanner from './components/InvestmentPlanner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Chatbot />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/group-savings" element={<GroupSavingsTracker />} />
          <Route path="/investment-planner" element={<InvestmentPlanner />} />
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
