import { boolean, z } from "zod";

// Common field validators
export const phoneNumberField = z
  .string()
  .regex(/^\+[1-9]\d{9,14}$/, "Phone number must be in E.164 format");


const roleField = z.enum(["user", "restaurantAdmin", "rider"], {
  required_error: "Role is required",
  invalid_type_error: "Invalid role"
});

const otpField = z.string()
  .length(6, "OTP should be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP should only contain numbers");

// Exported schemas
export const phoneNumberSchema = z.object({
  phoneNumber: phoneNumberField,

});

export const otpSchema = z.object({
  phoneNumber: phoneNumberField,
  otp: otpField,
  role: roleField,
});

export const phoneAndRoleSchema = z.object({
  phoneNumber: phoneNumberField,
  role: roleField,
  isNewUser: z.boolean()
});

