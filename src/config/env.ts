import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',

  // twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID!,

  // aws s3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
};
