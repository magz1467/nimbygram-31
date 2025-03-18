# Deployment Checklist

## Pre-Deployment

- [ ] Run cleanup script to remove duplicate configuration files
- [ ] Verify all environment variables are properly set
- [ ] Check for any hardcoded API keys and replace with environment variables
- [ ] Run local build verification

## Deployment Steps

1. **Initial Setup**
   - [ ] Create a new Netlify site if needed
   - [ ] Connect to the GitHub repository
   - [ ] Set required environment variables in Netlify:
     - [ ] `VITE_GOOGLE_MAPS_API_KEY`
     - [ ] `VITE_SKIP_TS_CHECK=true`

2. **First Deployment**
   - [ ] Deploy with minimal configuration
   - [ ] Check build logs for errors
   - [ ] Verify the site loads correctly

3. **Troubleshooting**
   - [ ] If build fails, try deploying the static fallback page
   - [ ] Address one error at a time
   - [ ] Re-deploy after each fix

## Post-Deployment

- [ ] Test all major functionality
- [ ] Check for console errors
- [ ] Verify API integrations are working
- [ ] Gradually fix TypeScript errors
- [ ] Remove any temporary workarounds

## Optimization

- [ ] Enable minification once everything is working
- [ ] Review and optimize bundle size
- [ ] Set up proper caching headers
- [ ] Configure custom domain if needed 