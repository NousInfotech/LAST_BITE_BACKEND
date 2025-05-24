import { processImageBuffer } from '../../utils/imageProccessor.js';
import { uploadImageToS3 } from '../services/image-upload.service.js';

export class UploadImageUseCase {
    static async processAndUploadImage(file: Express.Multer.File, folderName: string): Promise<string> {
        // 1. Process the image buffer using sharp
        const optimizedBuffer = await processImageBuffer(file.buffer);

        // 2. Upload to S3 and get back the URL
        const url = await uploadImageToS3({
            fileBuffer: optimizedBuffer,
            fileName: file.originalname,
            folderName: folderName,
            contentType: file.mimetype,
        });


        return url;
    }
}
