// src/config/twilioConfig.ts

import twilio from 'twilio';
import { config } from './env.js'; // Make sure you're importing the env variables

// Twilio credentials from .env
const TWILIO_ACCOUNT_SID = config.twilioAccountSid;
const TWILIO_AUTH_TOKEN = config.twilioAuthToken;
const TWILIO_VERIFY_SERVICE_SID = config.twilioVerifyServiceSid;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    throw new Error("Twilio credentials are not properly set in the .env file.");
}

// Initialize Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Create a function to initialize the Verify service
export const twilioVerifyService = client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID);

export default client;
