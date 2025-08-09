import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES || '30d',

  // twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID!,

  // aws s3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',

  // razorpay
  razorpayKeyId: process.env.TEST_RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.TEST_RAZORPAY_KEY_SECRET || '',
  
  // pidge
  pidgeUserName: process.env.PIDGE_USERNAME || '',
  pidgePassword: process.env.PIDGE_PASSWORD || '',
  pidgeBaseUrl: process.env.PIDGE_BASE_URL || '',

    // firebase 
  fb_type: process.env.FIREBASE_TYPE,
  fb_project_id: process.env.FIREBASE_PROJECT_ID?.replace(/['"]/g, ''), // Remove quotes
  fb_private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  fb_private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  fb_client_email: process.env.FIREBASE_CLIENT_EMAIL,
  fb_client_id: process.env.FIREBASE_CLIENT_ID,
  fb_auth_uri: process.env.FIREBASE_AUTH_URI,
  fb_token_uri: process.env.FIREBASE_TOKEN_URI,
  fb_auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  fb_client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  fb_universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};
