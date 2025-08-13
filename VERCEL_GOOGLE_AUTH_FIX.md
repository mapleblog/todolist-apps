# Vercel Google Authentication Fix Guide

This guide addresses the "Sign-in was cancelled. Please try again." error when using Google authentication on Vercel.

## Problem Analysis

The Google sign-in error typically occurs due to:
1. Missing or incorrect environment variables in Vercel
2. Unauthorized domains in Firebase Authentication
3. Incorrect OAuth configuration

## Solution Steps

### Step 1: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Navigate to your project: `todolist`

2. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add the following variables (use VITE_ prefix, not REACT_APP_):

   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

3. **Set Environment for All Environments**
   - Production: ✅
   - Preview: ✅ 
   - Development: ✅

### Step 2: Configure Firebase Authorized Domains

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project

2. **Add Vercel Domain to Authorized Domains**
   - Go to Authentication > Settings > Authorized domains
   - Click "Add domain"
   - Add your Vercel domain: `todolist-6kan8904a-mapleblogs-projects.vercel.app`
   - Also add: `*.vercel.app` (for preview deployments, Firebase supports wildcards)

### Step 3: Configure Google Cloud Console (if needed)

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your Firebase project

2. **Update OAuth Consent Screen**
   - Go to APIs & Services > OAuth consent screen
   - Add your Vercel domain to "Authorized domains"

3. **Update OAuth 2.0 Client**
   - Go to APIs & Services > Credentials
   - Find your OAuth 2.0 client ID
   - Add Authorized JavaScript origins:
     - `https://todolist-6kan8904a-mapleblogs-projects.vercel.app`
     - **Important**: Google Cloud does not support wildcards (*), you must add each specific domain
     - For preview deployments, add each preview domain individually
   - Add Authorized redirect URIs:
     - `https://todolist-6kan8904a-mapleblogs-projects.vercel.app/__/auth/handler`
     - **Note**: For preview deployments, add each specific preview domain's redirect URI individually (wildcards not supported)

### Step 4: Update Content Security Policy (CSP)

1. **Enhanced CSP Configuration**
   - The `vercel.json` file has been updated with improved CSP settings
   - Added support for Google services domains:
     - `https://accounts.google.com` (for Google sign-in)
     - `https://www.googletagmanager.com` (for analytics)
     - `https://translate.googleapis.com` (for translation services)
     - `https://securetoken.googleapis.com` (for Firebase auth tokens)
     - `https://firebase.googleapis.com` (for Firebase services)
   - Added `frame-src` directive to allow Google OAuth popup
   - Enhanced `connect-src` to include all necessary Firebase endpoints

### Step 5: Redeploy on Vercel

1. **Trigger New Deployment**
   - Go to Vercel Dashboard > Deployments
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger automatic deployment

2. **Verify Environment Variables**
   - Check deployment logs to ensure variables are loaded
   - Look for any missing environment variable warnings

## Testing the Fix

1. **Visit Your Vercel App**
   - Go to: https://todolist-gr3myfjj1-mapleblogs-projects.vercel.app

2. **Test Google Sign-in**
   - Click "Continue with Google"
   - Select your Google account
   - Verify successful authentication

## Google Cloud OAuth Configuration Important Notes

⚠️ **Critical Limitation**: Google Cloud Console OAuth 2.0 client configuration **does not support wildcards (*)**

### Correct Configuration Method:
 1. **Production Environment**: Add specific production domain
    - `https://todolist-6kan8904a-mapleblogs-projects.vercel.app`

2. **Preview Deployments**: Each preview deployment needs to be added individually
   - Vercel preview URL format: `https://todolist-[commit-hash]-mapleblogs-projects.vercel.app`
   - Each new preview deployment requires manual addition to Google Cloud Console

3. **Development Environment**: Add for local development
   - `http://localhost:3001`
   - `http://localhost:3000`

### Management Recommendations:
- To reduce configuration complexity, recommend testing Google login primarily in production environment
- Use Firebase emulator or test accounts during development
- Consider using custom domain names to simplify configuration management

## Common Issues and Solutions

### Issue 1: "Firebase: Error (auth/unauthorized-domain)"
**Solution:** Add your Vercel domain to Firebase authorized domains

### Issue 2: "Firebase: Error (auth/api-key-not-valid)"
**Solution:** Check environment variables in Vercel dashboard

### Issue 3: "Firebase: Error (auth/invalid-api-key)"
**Solution:** Regenerate API key in Firebase Console and update Vercel

### Issue 4: Environment variables not loading
**Solution:** 
- Ensure variable names use `VITE_` prefix
- Redeploy after adding variables
- Check deployment logs for errors

### Q: Still getting login errors?
A: Please check:
1. All environment variables are correctly set
2. Firebase authorized domains include your Vercel domain
3. Google OAuth client configuration is correct
4. Browser cache has been cleared

### Q: Do preview deployments also need configuration?
A: Yes, each preview deployment has a different URL and needs to be added individually to Firebase and Google OAuth configuration.

## Security Checklist

- ✅ Environment variables are set in Vercel
- ✅ Firebase authorized domains include Vercel domain
- ✅ Google OAuth client is configured with correct origins
- ✅ Firestore security rules are properly configured
- ✅ No sensitive data is exposed in client-side code

## Next Steps

After completing these steps:
1. Test authentication flow thoroughly
2. Verify todo functionality works correctly
3. Monitor Firebase usage and authentication logs
4. Set up monitoring for production errors

## Support Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)