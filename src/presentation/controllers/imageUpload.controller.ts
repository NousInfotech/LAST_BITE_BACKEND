import { Request, Response } from 'express';
import { imageUploadSchema, validateFolderByRole } from '../validators/image-upload.validator.js';
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
        // 1. Validate body schema
        const validated = validate(imageUploadSchema, req.body, res);
        if (!validated) return;

        const { folderName } = validated;
        const role = req.role as Role;
        const imageFile = req.file;

        // 2. Validate file presence
        if (!imageFile) {
            sendError(res, HTTP.NOT_FOUND, "File is Missing");
            return;
        }

        // 3. Validate folder permissions based on role
        if (!validateFolderByRole(folderName, role)) {
            sendError(res, HTTP.NOT_FOUND, "Un-Authorized Access");
            return;
        }

        // 4. Upload image and return response
        return tryCatch(res, async () => {
            const imageUrl = await UploadImageUseCase.processAndUploadImage(imageFile, folderName);
            if (!imageUrl) {
                sendError(res, HTTP.NOT_FOUND, "File Uploading Failed");
                return;
            }
            return sendResponse(res, HTTP.OK, "Image Uploaded successfully", imageUrl);
        });
    }
}
