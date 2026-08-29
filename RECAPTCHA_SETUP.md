# reCAPTCHA Setup Guide

## Overview

This application uses Google reCAPTCHA v3 for bot protection on authentication forms. The implementation includes helpful error messages and configuration checks for development environments.

## Required Environment Variables

To enable reCAPTCHA, you need to set the following environment variables in your `.env.local` file:

```env
# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
NEXT_PUBLIC_RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

## Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose "reCAPTCHA v3" as the reCAPTCHA type
4. Add your domain(s) to the list
5. Accept the terms of service
6. Click "Submit"
7. Copy the **Site Key** and **Secret Key**

## Environment Variable Details

- **`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`**: This is the public key that gets embedded in your frontend code. It's safe to expose publicly.
- **`NEXT_PUBLIC_RECAPTCHA_SECRET_KEY`**: This is the private key used on the server side to verify tokens. Keep this secret.

## Current Implementation

The application now includes:
- **Configuration validation** on component mount
- **Helpful error messages** when reCAPTCHA is not configured
- **Development debugging** with a status indicator
- **Console warnings** for missing configuration

## Development vs Production

### Development
- The app will show a yellow status indicator in the bottom-right corner
- Console warnings will indicate missing configuration
- Forms will display clear error messages about missing reCAPTCHA setup
- You can run the app without reCAPTCHA for testing other features

### Production
- **Always set both environment variables** before deploying
- Ensure your domain is added to the reCAPTCHA admin console
- Test the reCAPTCHA functionality thoroughly

## Troubleshooting

### "reCAPTCHA not ready. Please try again."
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in your `.env.local` file
- Verify the site key is correct
- Ensure your domain is whitelisted in reCAPTCHA admin console
- Restart your development server after adding environment variables

### "reCAPTCHA is not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment variables."
- This is a helpful error message indicating missing configuration
- Follow the setup steps above to add your reCAPTCHA keys
- Create a `.env.local` file in your project root if it doesn't exist

### reCAPTCHA not loading
- Check browser console for JavaScript errors
- Verify the site key is valid
- Ensure no ad blockers are interfering with Google's scripts
- Check the development status indicator for configuration issues

## Quick Fix Steps

1. **Create `.env.local` file** in your project root:
   ```bash
   touch .env.local
   ```

2. **Add your reCAPTCHA keys**:
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_actual_site_key_here
   NEXT_PUBLIC_RECAPTCHA_SECRET_KEY=your_actual_secret_key_here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Check the status indicator** in the bottom-right corner for confirmation

## Security Notes

- Never commit your `.env.local` file to version control
- The secret key should only be accessible on your server
- reCAPTCHA v3 provides a score-based approach - you can adjust the threshold in your verification logic
- Consider implementing rate limiting alongside reCAPTCHA for additional protection

## Implementation Details

The application uses:
- `react-google-recaptcha-v3` for the frontend integration
- Configuration validation utilities (`lib/recaptcha-config.ts`)
- Server-side verification in API routes (`/api/auth/verifyCaptcha`, `/api/auth/captcha`)
- Configurable scoring thresholds (default: 0.6)
- Development debugging components

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Look at the development status indicator
3. Verify your environment variables are set correctly
4. Check that you've restarted your development server
5. Ensure your domain is whitelisted in reCAPTCHA admin console
6. Test with a simple reCAPTCHA implementation first

## Common Issues

### Environment variables not loading
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Restart your development server after adding the file
- Check that the file is in your project root directory

### reCAPTCHA still not working after setup
- Clear your browser cache and cookies
- Check that the domain in your reCAPTCHA admin console matches your development URL
- Verify there are no typos in your environment variables
- Check the browser console for any JavaScript errors


