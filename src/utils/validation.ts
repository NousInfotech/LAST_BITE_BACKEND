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
    const result = schema.safeParse(data);

    if (!result.success) {
        res.status(400).json({
            message: "Validation Failed",
            errors: result.error.format(),
        });
        return null;
    }

    return result.data;
};
