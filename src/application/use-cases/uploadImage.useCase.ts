import { processImageBuffer } from '../../utils/imageProccessor.js';
import { deleteImageFromS3 } from '../services/image-delete.service.js';
import { uploadImageToS3 } from '../services/image-upload.service.js';

export class UploadImageUseCase {
    static async processAndUploadImage(file: Express.Multer.File, folderName: string): Promise<string> {
        const optimizedBuffer = await processImageBuffer(file.buffer);

        const url = await uploadImageToS3({
            fileBuffer: optimizedBuffer,
            fileName: file.originalname,
            folderName,
            contentType: file.mimetype,
        });

        return url;
    }

    static async replaceImage(
        oldImageUrl: string,
        newFile: Express.Multer.File,
        folderName: string
    ): Promise<string> {
        if (oldImageUrl) {
            try {
                const key = this.extractS3KeyFromUrl(oldImageUrl);
                await deleteImageFromS3(key);
            } catch (err) {
                console.warn("Failed to delete old image:", err);
                // continue uploading new image
            }
        }

        return await this.processAndUploadImage(newFile, folderName);
    }

    static async deleteImage(imageUrl: string): Promise<boolean> {
        if (!imageUrl) throw new Error("Image URL is required to delete.");
        const key = this.extractS3KeyFromUrl(imageUrl);
        const success = await deleteImageFromS3(key);
        return success;
    }


    private static extractS3KeyFromUrl(url: string): string {
        const match = url.match(/amazonaws\.com\/(.+)$/);
        if (!match || !match[1]) throw new Error("Invalid S3 image URL format.");
        return match[1];
    }
}
