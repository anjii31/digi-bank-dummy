# Free AI Setup Guide for DigiBank Chatbot

This guide will help you set up free AI capabilities for the DigiBank chatbot using free AI APIs.

## Overview

The chatbot now uses a simplified AI service with two free AI options:
1. **Cohere AI** (Recommended - more reliable)
2. **Hugging Face Inference API** (Backup option)

If both AI services fail, the chatbot falls back to enhanced rule-based responses.

## Setup Instructions

### Step 1: Create a `.env` file

Create a `.env` file in your project root directory:

```bash
# Create .env file
touch .env
```

### Step 2: Get Free API Keys

#### Option 1: Cohere AI (Recommended)
1. Go to [Cohere AI](https://cohere.ai/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Add to `.env` file:
   ```
   VITE_COHERE_API_KEY=your-cohere-api-key-here
   ```

#### Option 2: Hugging Face (Backup)
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token with "read" permissions
5. Copy your token
6. Add to `.env` file:
   ```
   VITE_HUGGINGFACE_API_KEY=your-huggingface-token-here
   ```

### Step 3: Complete `.env` File

Your `.env` file should look like this:

```env
# Cohere AI (Recommended)
VITE_COHERE_API_KEY=your-cohere-api-key-here

# Hugging Face (Backup)
VITE_HUGGINGFACE_API_KEY=your-huggingface-token-here

# Firebase Configuration (if using Firebase)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 4: Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## How It Works

### AI Priority Order:
1. **Cohere AI** - Tries first (most reliable free tier)
2. **Hugging Face** - Tries if Cohere fails
3. **Enhanced Rule-based** - Fallback if both AI services fail

### Features:
- **Smart Responses**: AI-powered banking assistance
- **Quick Replies**: Context-aware suggested responses
- **Fallback System**: Always works, even without API keys
- **Error Handling**: Graceful degradation when APIs are unavailable

## Testing

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Log in to access the dashboard
4. Click the chatbot icon in the bottom-right corner
5. Try asking banking-related questions

### Test Questions:
- "What's my account balance?"
- "How do I transfer money?"
- "Tell me about investment options"
- "I need help with my card"

## Troubleshooting

### No AI Responses
- Check that your API keys are correctly set in `.env`
- Ensure the `.env` file is in the project root
- Restart the development server after adding API keys
- Check browser console for error messages

### API Errors
- **401 Unauthorized**: Check your API key
- **429 Rate Limited**: Wait a few minutes and try again
- **404 Not Found**: Model temporarily unavailable (will use fallback)

### Environment Variables Not Working
- Make sure you're using `import.meta.env.VITE_*` (not `process.env`)
- Restart the development server after changing `.env`
- Check that the `.env` file is not in `.gitignore`

## Free Tier Limits

### Cohere AI:
- 5 requests per minute (free tier)
- 100 requests per month (free tier)

### Hugging Face:
- Rate limits vary by model
- Some models may be temporarily unavailable

### Fallback System:
- No limits - always available
- Professional banking responses
- Context-aware quick replies

## Security Notes

- Never commit your `.env` file to version control
- API keys are only used in the browser (client-side)
- The chatbot works without API keys using fallback responses
- All sensitive operations redirect to secure banking channels

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct
3. Test with simple questions first
4. The fallback system ensures the chatbot always works

The chatbot will work perfectly even without any API keys, using the enhanced rule-based system for professional banking responses. 