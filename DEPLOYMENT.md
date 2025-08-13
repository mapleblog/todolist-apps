# Deployment Guide

This guide covers how to deploy the TodoList application to production environments.

## Prerequisites

- Node.js 18+ installed
- Firebase project configured
- Git repository set up
- Environment variables configured

## Environment Variables

Before deploying, ensure you have the following environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### Prerequisites
- Vercel account
- Vercel CLI installed: `npm i -g vercel`

#### Steps

1. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   npm run deploy:vercel
   ```

4. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all required environment variables
   - Redeploy if necessary

#### Automatic Deployment

1. **Connect GitHub repository**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Configure environment variables**
   - Add all environment variables in project settings
   - Enable automatic deployments on push

### Option 2: Netlify

#### Prerequisites
- Netlify account
- Netlify CLI installed: `npm i -g netlify-cli`

#### Steps

1. **Build the project**
   ```bash
   npm install
   npm run build
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   npm run deploy:netlify
   ```

#### Automatic Deployment

1. **Connect GitHub repository**
   - Go to Netlify dashboard
   - Connect your GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Publish Directory: `dist`

2. **Configure environment variables**
   - Go to Site settings > Environment variables
   - Add all required environment variables

## Performance Optimization

### Before Deployment

1. **Run optimization script**
   ```bash
   npm run optimize
   ```

2. **Analyze bundle size**
   ```bash
   npm run build:analyze
   ```

3. **Test production build locally**
   ```bash
   npm run test:build
   ```

### Performance Features Included

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Asset Optimization**: Images and static assets optimized
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip compression enabled
- **Tree Shaking**: Unused code eliminated

## Security Configuration

### Security Headers

Both Vercel and Netlify configurations include:

- Content Security Policy (CSP)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

### Firebase Security Rules

Ensure your Firebase security rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Domain Configuration

### Custom Domain (Vercel)

1. Go to project settings in Vercel
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

### Custom Domain (Netlify)

1. Go to site settings in Netlify
2. Add your custom domain
3. Configure DNS records
4. Enable HTTPS

## Monitoring and Analytics

### Performance Monitoring

The application includes built-in performance monitoring:

- Web Vitals tracking
- Bundle size analysis
- Memory usage monitoring
- Load time tracking

### Error Tracking

Consider integrating error tracking services:

- Sentry
- LogRocket
- Bugsnag

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Check linting errors: `npm run lint`
   - Verify environment variables

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check security rules
   - Ensure proper domain configuration

3. **Performance Issues**
   - Analyze bundle size: `npm run build:analyze`
   - Check network requests
   - Monitor Web Vitals

### Support

For deployment issues:

1. Check build logs in your deployment platform
2. Verify environment variables
3. Test locally with production build
4. Check Firebase console for errors

## Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor performance**
   - Check Web Vitals scores
   - Monitor bundle size
   - Review error logs

3. **Security updates**
   - Keep dependencies updated
   - Review security headers
   - Update Firebase rules if needed

### Backup Strategy

- Firebase data is automatically backed up
- Keep environment variables secure
- Maintain Git repository with proper branching

---

**Note**: Always test deployments in a staging environment before deploying to production.