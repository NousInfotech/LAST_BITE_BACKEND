import { Request, Response } from 'express';
import {
    imageUploadSchema,
    imageUpdateSchema,
    imageDeleteSchema,
    validateFolderByRole,
} from '../validators/image-upload.validator.js';
import { UploadImageUseCase } from '../../application/use-cases/uploadImage.useCase.js';
import { validate } from '../../utils/validation.js';
import { CustomRequest, Role } from '../../domain/interfaces/utils.interface.js';
import { sendError } from '../../utils/sendError.js';
import { HTTP } from '../../utils/constants.js';
import { tryCatch } from '../../utils/tryCatch.js';
import { sendResponse } from '../../utils/sendResponse.js';

interface FileUploadCustomRequest extends CustomRequest {
    file?: Express.Multer.File;
}

export class ImageUploadController {
    static async uploadImage(req: FileUploadCustomRequest, res: Response) {
        // Validate request body
        const validated = validate(imageUploadSchema, req.body, res);
        if (!validated) return;

        const { folderName } = validated;
        const role = req.role as Role;
        const imageFile = req.file;

        if (!imageFile) {
            sendError(res, HTTP.NOT_FOUND, "File is Missing");
            return;
        }

        if (!validateFolderByRole(folderName, role)) {
            sendError(res, HTTP.NOT_FOUND, "Un-Authorized Access");
            return;
        }

        return tryCatch(res, async () => {
            const imageUrl = await UploadImageUseCase.processAndUploadImage(imageFile, folderName);
            if (!imageUrl) {
                sendError(res, HTTP.NOT_FOUND, "File Uploading Failed");
                return;
            }
            return sendResponse(res, HTTP.OK, "Image Uploaded successfully", imageUrl);
        });
    }

    static async updateImage(req: FileUploadCustomRequest, res: Response) {
        // Validate update schema (folderName, oldImageUrl, file)
        const validated = validate(imageUpdateSchema, req.body, res);
        if (!validated) return;

        const { folderName, oldImageUrl } = validated;
        const role = req.role as Role;
        const newFile = req.file;

        if (!newFile) {
            sendError(res, HTTP.NOT_FOUND, "New file is Missing");
            return;
        }

        if (!validateFolderByRole(folderName, role)) {
            sendError(res, HTTP.NOT_FOUND, "Un-Authorized Access");
            return;
        }

        return tryCatch(res, async () => {
            const updatedUrl = await UploadImageUseCase.replaceImage(oldImageUrl, newFile, folderName);
            if (!updatedUrl) {
                sendError(res, HTTP.NOT_FOUND, "Image Updating Failed");
                return;
            }
            return sendResponse(res, HTTP.OK, "Image Updated successfully", updatedUrl);
        });
    }

    static async deleteImage(req: Request, res: Response) {
        // Validate delete schema (imageUrl)
        const validated = validate(imageDeleteSchema, req.body, res);
        if (!validated) return;

        const { imageUrl } = validated;
        const role = (req as CustomRequest).role as Role;

        // Extract folder from imageUrl to check permissions
        // Assuming imageUrl format: https://bucket.region.amazonaws.com/folderName/fileName
        const urlParts = imageUrl.split('/');
        if (urlParts.length < 4) {
            sendError(res, HTTP.BAD_REQUEST, "Invalid Image URL format");
            return;
        }
        const folderName = urlParts[urlParts.length - 2] as any; // last second segment is folderName

        if (!validateFolderByRole(folderName, role)) {
            sendError(res, HTTP.NOT_FOUND, "Un-Authorized Access");
            return;
        }

        return tryCatch(res, async () => {
            const deleted = await UploadImageUseCase.deleteImage(imageUrl);
            if (!deleted) {
                sendError(res, HTTP.NOT_FOUND, "Image Deletion Failed");
                return;
            }
            return sendResponse(res, HTTP.OK, "Image Deleted successfully");
        });
    }
}
