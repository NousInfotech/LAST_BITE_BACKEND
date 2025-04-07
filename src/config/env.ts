import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',


  // firebase 

  fb_type: process.env.FIREBASE_TYPE,
  fb_project_id: process.env.FIREBASE_PROJECT_ID,
  fb_private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  fb_private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  fb_client_email: process.env.FIREBASE_CLIENT_EMAIL,
  fb_client_id: process.env.FIREBASE_CLIENT_ID,
  fb_auth_uri: process.env.FIREBASE_AUTH_URI,
  fb_token_uri: process.env.FIREBASE_TOKEN_URI,
  fb_auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  fb_client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  fb_universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
} 