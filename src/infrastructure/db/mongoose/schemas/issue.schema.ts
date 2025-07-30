// src/infrastructure/database/mongo/modules/issue.schema.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IIssue, IssueStatus } from '../../../../domain/interfaces/issue.interface.js';
import { addCustomIdHook } from '../../../../utils/addCustomIdHook.js';
import { RoleEnum } from '../../../../domain/interfaces/utils.interface.js';

export interface IssueDoc extends IIssue, Document { }

const issueSchema = new Schema<IssueDoc>(
    {
        issueId: { type: String, unique: true },
        raisedByRole: { type: String, enum: RoleEnum, required: true },
        raisedById: { type: String, required: true },
        targetRole: { type: String, enum: RoleEnum, required: true },
        targetId: { type: String, required: true },
        description: { type: String, required: true },
        relatedOrderId: { type: String },
        tags: { type: [String], required: true },
        status: {
            type: String,
            enum: Object.values(IssueStatus), // This converts the enum into array of valid strings
            default: IssueStatus.OPEN,        // Use enum constant instead of raw string
        }
    },
    { timestamps: true }
);

// Auto-generate custom ID
addCustomIdHook(issueSchema, 'issueId', 'iss', 'Issue');

export const IssueModel: Model<IssueDoc> = mongoose.model<IssueDoc>('Issue', issueSchema);
