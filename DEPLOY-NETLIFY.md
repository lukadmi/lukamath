# Netlify Deployment Guide - LukaMath Frontend

This guide explains how to deploy the LukaMath frontend to Netlify as a static single-page application.

## Build Configuration

**Build Command:** `npm run build:static`  
**Publish Directory:** `dist/public`  
**Node Version:** 20

## Deployment Methods

### Method A: Drag & Drop (Quick Deploy)

1. Run the build command locally: `npm run build:static`
2. Open [Netlify Dashboard](https://app.netlify.com/)
3. Drag and drop the `dist/public` folder to the deployment area
4. Your site will be deployed with a random subdomain

### Method B: Git Integration (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Go to [Netlify Dashboard](https://app.netlify.com/) → "New site from Git"
3. Connect your Git provider and select the repository
4. Configure build settings:
   - **Build command:** `npm run build:static`
   - **Publish directory:** `dist/public`
   - **Node version:** 20 (set in Environment variables)
5. Click "Deploy site"

## Custom Domain Setup

1. In your Netlify site dashboard, go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Enter your domain name (e.g., `lukamath.com`)
4. Follow the DNS configuration instructions provided by Netlify
5. Enable HTTPS (automatic with Netlify's SSL certificates)

## Important Notes

- **Backend APIs are NOT deployed here** - This is frontend-only deployment
- All API calls will need to be configured to point to your backend server
- The `_redirects` file ensures proper SPA routing for client-side navigation
- Environment variables for the frontend should be prefixed with `VITE_`

## Troubleshooting

- If routes don't work, ensure `_redirects` file is in `client/public/`
- For API connection issues, verify your backend endpoint URLs
- Check build logs in Netlify dashboard for any build failures