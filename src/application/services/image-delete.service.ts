// src/services/imageDelete.service.ts
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../config/aws.config.js";
import { config } from "../../config/env.js";

export async function deleteImageFromS3(key: string): Promise<boolean> {
    try {
        const deleteParams = {
            Bucket: config.awsS3Bucket,
            Key: key, // e.g. 'restaurants/image123.webp'
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        return true;
    } catch (error) {
        console.error("Error deleting image from S3:", error);
        return false;
    }
}
