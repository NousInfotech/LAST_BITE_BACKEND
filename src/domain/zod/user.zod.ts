// src/domain/zod/user.schema.ts
import { z } from "zod";
import { AddressSchema } from "./utils.zod.js";
import { phoneNumberField } from "../../presentation/validators/auth.validator.js";


export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phoneNumber: phoneNumberField,
    email: z.string().email("Invalid email").optional(),
    profileImage: z.string().optional(),
    addresses: z.array(AddressSchema).optional(),
});

