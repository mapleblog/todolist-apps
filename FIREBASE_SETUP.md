# Firebase Setup Guide

This guide will help you set up Firebase for your TodoList application.

## Prerequisites

- Google account
- Node.js and npm installed
- Project files already created

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `personal-todolist` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Google** provider:
   - Click on "Google"
   - Toggle "Enable"
   - Enter your project support email
   - Click "Save"

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`)
4. Register app with nickname: `todolist-web`
5. **Don't** check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the configuration object

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in `.env`:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

## Step 6: Set up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own todos
    match /todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Configure Google OAuth (Optional)

If you want to customize the OAuth experience:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 client ID
5. Configure authorized domains if needed

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Click "Continue with Google"
4. Complete the authentication flow
5. Verify that you can sign in and out successfully

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console
   - Go to Authentication > Settings > Authorized domains
   - Add `localhost` for development

2. **"Firebase: Error (auth/api-key-not-valid)"**
   - Check that your API key is correct in `.env`
   - Ensure there are no extra spaces or quotes

3. **"Firebase: Error (auth/invalid-api-key)"**
   - Regenerate your API key in Firebase Console
   - Update `.env` with the new key

4. **Environment variables not loading**
   - Ensure `.env` file is in the project root
   - Restart your development server
   - Check that variable names start with `VITE_`

### Security Notes:

- Never commit `.env` file to version control
- Use different Firebase projects for development and production
- Regularly review and update Firestore security rules
- Monitor authentication usage in Firebase Console

## Next Steps

Once Firebase is configured:

1. Test user authentication
2. Verify Firestore database connection
3. Proceed with todo management features development

## Support

For additional help:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)