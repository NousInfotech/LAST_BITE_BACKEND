import { z } from "zod";
import { imageFolders, ImageFolder, allowedFoldersByRole } from "../../utils/constants.js";
import { Role } from "../../domain/interfaces/utils.interface.js";

export const imageUploadSchema = z.object({
    folderName: z.enum(imageFolders),
    file: z
        .any()
        .refine((file) => file && file.mimetype?.startsWith("image/"), {
            message: "File must be an image.",
        }),
});

// This function checks whether a given role is allowed to upload to a specific folder
export const validateFolderByRole = (folder: ImageFolder, role: Role): boolean => {
    const allowed = allowedFoldersByRole[role];
    return allowed?.includes(folder) ?? false;
};
