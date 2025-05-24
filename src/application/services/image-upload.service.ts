// src/services/imageUpload.service.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../config/aws.config.js";
import { config } from "../../config/env.js";

interface UploadParams {
    fileBuffer: Buffer;
    fileName: string;
    folderName: string; // e.g., 'restaurants' or 'restaurant-documents'
    contentType: string;
}

export async function uploadImageToS3({
    fileBuffer,
    fileName,
    folderName,
    contentType,
}: UploadParams): Promise<string> {
    try {
        // Construct the full key (path in the bucket)
        const key = `${folderName}/${fileName}`;

        const uploadParams = {
            Bucket: config.awsS3Bucket,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Return the public URL or key
        return `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Failed to upload file");
    }
}
