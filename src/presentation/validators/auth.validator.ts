import { z } from "zod";

// Schema for validating phone number
export const phoneNumberSchema = z.object({
    phoneNumber: z.string()
        .min(10, "Phone number should be at least 10 characters long")
        .max(15, "Phone number should not exceed 15 characters")
        .regex(/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, "Invalid phone number format")
        .refine((val) => val.length >= 10 && val.length <= 15, {
            message: "Phone number must be between 10 and 15 digits.",
        }),
});

// Schema for validating OTP
export const otpSchema = z.object({
    phoneNumber: z.string()
        .min(10, "Phone number is required")
        .max(15, "Phone number should not exceed 15 characters"),
    otp: z.string()
        .length(6, "OTP should be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP should only contain numbers"),
});
