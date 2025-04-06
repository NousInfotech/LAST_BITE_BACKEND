import { nanoid } from "nanoid";
import { Schema } from "mongoose";

/**
 * Adds a pre-save hook to auto-generate a unique custom ID.
 * @param schema - Mongoose schema
 * @param fieldName - Field name to store custom ID (e.g. "userId")
 * @param prefix - Prefix for the ID (e.g. "usr")
 * @param modelName - Mongoose model name (used to check uniqueness)
 */
export function addCustomIdHook(
  schema: Schema,
  fieldName: string,
  prefix: string,
  modelName: string
) {
  schema.pre("save", async function (next) {
    if ((this as any)[fieldName]) return next();

    const model = this.constructor as any;
    let uniqueId = `${prefix}_${nanoid(10)}`;
    let exists = await model.exists({ [fieldName]: uniqueId });

    while (exists) {
      uniqueId = `${prefix}_${nanoid(10)}`;
      exists = await model.exists({ [fieldName]: uniqueId });
    }

    (this as any)[fieldName] = uniqueId;
    next();
  });
}
