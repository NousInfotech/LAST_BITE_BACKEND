import { z } from "zod";

export const MartStoreAdminSchema = z.object({
  restaurantId: z.string().min(1, "restaurantId is required"),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().regex(/^\+91\d{10}$/, "Invalid phone number"),
  email: z.string().email().optional(),
});
