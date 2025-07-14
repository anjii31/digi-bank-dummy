import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_RI-K_bKX_P1x0RJTLNZlsvxyYzvTqlk",
  authDomain: "digibank-c468c.firebaseapp.com",
  projectId: "digibank-c468c",
  storageBucket: "digibank-c468c.firebasestorage.app",
  messagingSenderId: "188690744937",
  appId: "1:188690744937:web:79276f8cecb823b29d44f8",
  measurementId: "G-Q79L7SWJCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 