import { z } from "zod";


export const AddressSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    no: z.string(),
    street: z.string(),
    area: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    pincode: z.string(),
    address: z.string(), // Full written address
    tag: z.string(), // home, office, others
});
