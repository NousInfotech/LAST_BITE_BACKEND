import { z } from "zod";
import { imageFolders, ImageFolder, allowedFoldersByRole } from "../../utils/constants.js";
import { Role } from "../../domain/interfaces/utils.interface.js";

// For upload: need new image file, and folderName
export const imageUploadSchema = z.object({
    folderName: z.enum(imageFolders),
});

export const imageFileSchema = z.object({
    file: z
        .any()
        .refine((file) => file && file.mimetype?.startsWith("image/"), {
            message: "File must be an image.",
        }),
})

// For update: need oldImageUrl, new image file, and folderName
export const imageUpdateSchema = z.object({
    folderName: z.enum(imageFolders),
    oldImageUrl: z.string().url({ message: "Old image URL must be a valid URL" }),
    file: z
        .any()
        .refine((file) => file && file.mimetype?.startsWith("image/"), {
            message: "File must be an image.",
        }),
});

// For delete: only the imageUrl to delete
export const imageDeleteSchema = z.object({
    imageUrl: z.string().url({ message: "Image URL must be a valid URL" }),
});

// Folder permission validation (same as before)
export const PUBLIC_FOLDERS: ImageFolder[] = ["restaurants", "users"]; // folders allowed without role

export const validateFolderByRole = (folder: ImageFolder, role?: Role): boolean => {
    if (!role) {
        // If no role, only allow public folders
        return PUBLIC_FOLDERS.includes(folder);
    }

    const allowed = allowedFoldersByRole[role];
    return allowed?.includes(folder) ?? false;
};

