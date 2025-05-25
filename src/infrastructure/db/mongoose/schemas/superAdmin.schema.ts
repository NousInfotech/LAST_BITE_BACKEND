// models/superAdmin.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { ISuperAdmin } from "../../../../domain/interfaces/superAdmin.interface.js";

interface SuperAdminDoc extends ISuperAdmin, Document { }


const superAdminSchema = new Schema<SuperAdminDoc>(
    {
        superAdminId: { type: String, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["superAdmin"], default: "superAdmin" },
    },
    { timestamps: true }
);

// Auto-hash password before saving
superAdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    next();
});

// Custom ID hook (e.g. sadm_abc123)
addCustomIdHook(superAdminSchema, "superAdminId", "sadm", "SuperAdmin");

export const SuperAdminModel: Model<SuperAdminDoc> = mongoose.model("SuperAdmin", superAdminSchema);
