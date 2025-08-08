import { ZodSchema } from "zod";
import { Response } from "express";

/**
 * Validate request data using a given Zod schema.
 * If invalid, sends the error response and returns null.
 */
export const validate = <T>(
    schema: ZodSchema<T>,
    data: unknown,
    res: Response
): T | null => {
    // Safely stringify data, handling circular references
    const safeStringify = (obj: unknown) => {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            if (error instanceof Error && error.message.includes('circular')) {
                return '[Circular structure detected]';
            }
            return '[Unable to stringify object]';
        }
    };
    
    console.log('Validating data:', safeStringify(data));
    
    const result = schema.safeParse(data);

    if (!result.success) {
        console.error('Validation failed:', JSON.stringify(result.error.format(), null, 2));
        res.status(400).json({
            message: "Validation Failed",
            errors: result.error.format(),
        });
        return null;
    }

    console.log('Validation successful');
    return result.data;
};
