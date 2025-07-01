// src/domain/zod/user.schema.ts
import { z } from "zod";
import { AddressSchema } from "./utils.zod.js";
import { phoneNumberField } from "../../presentation/validators/auth.validator.js";


export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  phoneNumber: phoneNumberField,
  profileImage: z.string().optional(),
  addresses: z.array(AddressSchema).optional(),
});

export const userCollectionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Collection name is required"),
  foodItemIds: z.array(z.string()).min(1, "At least one food item is required"),
});


