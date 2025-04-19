// src/services/twilio.service.ts

import { twilioVerifyService } from "../../config/twilioConfig.js";

// Send OTP via SMS
export const sendOtp = async (phoneNumber: string): Promise<string> => {
    try {
        // Send OTP to the phone number
        const verification = await twilioVerifyService.verifications.create({
            customMessage:"",
            to: phoneNumber,
            channel: "sms", // You can change this to 'email' if needed
        });

        if (verification.status !== "pending") {
            throw new Error("Failed to send OTP");
        }

        return verification.sid; // Return the SID for tracking purposes if needed
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Error sending OTP");
    }
};

// Verify OTP entered by the user
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
        // Verify OTP
        const verificationCheck = await twilioVerifyService.verificationChecks.create({
            to: phoneNumber,
            code: otp,
        });

        if (verificationCheck.status === "approved") {
            return true;
        }

        return false; // OTP is incorrect
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw new Error("Error verifying OTP");
    }
};
