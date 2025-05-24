// src/config/aws.config.ts
import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./env.js"; // your environment variables

if (!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsRegion) {
  throw new Error("AWS credentials or region not set in environment variables");
}

export const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
});
