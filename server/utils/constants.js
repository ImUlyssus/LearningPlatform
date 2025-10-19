// utils/constants.js
const ROLES = {
  ADMIN: '8423',
  MANAGER: '6355',
  LECTURER: '3840',
  NORMAL: '1000'
};
const WEBSITE_NAME = "Website name";
const WEBSITE_NAME_LOWER = "websitename";
const API_BASE_URL = "https://localhost:3001"; // You could add other constants here too
const DEFAULT_CURRENCY = "MMK";
const PRIMARY_COLOR = "#2B4468"
const GOOGLE_FORM_LINK = "https://forms.gle/your-google-form-link"; // Your actual Google Form URL
const FACEBOOK_CONTACT_LINK = "https://facebook.com/your-page-url"; // Your Facebook page URL
const LECTURE_ERROR_EMAIL = `lecture.support@${WEBSITE_NAME_LOWER}.com`
const SUPPORT_EMAIL = `support@${WEBSITE_NAME_LOWER}.com`
const PRIVACY_POLICY_EMAIL = `privacy@${WEBSITE_NAME_LOWER}.com`
const TERMS_EMAIL = `terms-of-service@${WEBSITE_NAME_LOWER}.com`
const PHONE = `+669-6867-3614`

module.exports = {ROLES, WEBSITE_NAME, WEBSITE_NAME_LOWER, API_BASE_URL, DEFAULT_CURRENCY, PRIMARY_COLOR, GOOGLE_FORM_LINK, SUPPORT_EMAIL, PRIVACY_POLICY_EMAIL, TERMS_EMAIL, PHONE}

