# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for your DigiBank application.

## 🔥 Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "digibank-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 🔑 Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle the "Enable" switch
   - Click "Save"

## ⚙️ Step 3: Get Your Firebase Configuration

1. In your Firebase project console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "DigiBank Web App")
6. Copy the Firebase configuration object

## 📝 Step 4: Update Firebase Configuration

1. Open `src/firebase.js` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 🚀 Step 5: Test Your Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5174` (or the port shown in your terminal)

3. Test the authentication flow:
   - Try creating a new account
   - Try logging in with the created account
   - Test the "Forgot Password" functionality

## 🔒 Security Features Included

- **Email/Password Authentication**: Secure user registration and login
- **Password Reset**: Users can reset their passwords via email
- **Protected Routes**: Dashboard is only accessible to authenticated users
- **Form Validation**: Client-side validation for all forms
- **Loading States**: Visual feedback during authentication operations
- **Error Handling**: User-friendly error messages

## 📱 Features Available

### Authentication
- ✅ User registration with email and password
- ✅ User login with email and password
- ✅ Password reset via email
- ✅ User logout
- ✅ Protected routes
- ✅ User profile management

### Banking Dashboard
- ✅ Account balance display
- ✅ Recent transactions
- ✅ Quick action buttons
- ✅ Security status indicators
- ✅ Responsive design

## 🛠️ Customization Options

### Styling
- Modify `src/App.css` for custom animations and effects
- Update `src/index.css` for global styling changes
- Customize Bootstrap classes in components

### Firebase Features
- Add Google Sign-in: Enable in Firebase Console and add to AuthContext
- Add Phone Authentication: Enable in Firebase Console and add to AuthContext
- Add Email Verification: Enable in Firebase Console and add to AuthContext

### Additional Features
- Add user profile management
- Implement real-time data with Firestore
- Add transaction history
- Implement money transfer functionality

## 🚨 Important Notes

1. **Never commit your Firebase config to public repositories**
2. **Set up proper Firebase security rules**
3. **Enable email verification for production**
4. **Set up proper domain restrictions in Firebase Console**
5. **Monitor authentication usage in Firebase Console**

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/user-not-found)"**
   - User doesn't exist, check email spelling

2. **"Firebase: Error (auth/wrong-password)"**
   - Incorrect password entered

3. **"Firebase: Error (auth/email-already-in-use)"**
   - Email already registered, use login instead

4. **"Firebase: Error (auth/weak-password)"**
   - Password must be at least 6 characters

5. **"Firebase: Error (auth/invalid-email)"**
   - Invalid email format

### Development Tips:

- Use browser developer tools to check for console errors
- Verify Firebase configuration is correct
- Check Firebase Console for authentication logs
- Test with different email addresses

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Verify your Firebase configuration
3. Ensure all dependencies are installed
4. Check browser console for JavaScript errors

Happy coding! 🎉 