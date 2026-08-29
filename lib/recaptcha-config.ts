export const recaptchaConfig = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  secretKey: process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY,
  isEnabled: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
};

export const validateRecaptchaConfig = () => {
  if (!recaptchaConfig.isEnabled) {
    console.warn('⚠️ reCAPTCHA is not configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment variables.');
    console.warn('📖 See RECAPTCHA_SETUP.md for setup instructions.');
    return false;
  }
  return true;
};

export const getRecaptchaErrorMessage = () => {
  if (!recaptchaConfig.isEnabled) {
    return 'reCAPTCHA is not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment variables.';
  }
  return 'reCAPTCHA not ready. Please try again.';
};
