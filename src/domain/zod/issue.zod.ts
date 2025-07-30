// src/domain/zod/issue.schema.ts
import { string, z } from 'zod';
import { RoleEnum } from '../interfaces/utils.interface';
import { IssueStatus } from '../interfaces/issue.interface';

export const issueZodSchema = z.object({
    raisedByRole: z.nativeEnum(RoleEnum),
    raisedById: z.string().min(1),
    targetRole: z.nativeEnum(RoleEnum),
    targetId: z.string().min(1),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    relatedOrderId: z.string().optional(),
    status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
    tags: z.array(string()),
});

export const issueStatusSchema = z.object({
    issueId: z.string(),
    status: z.nativeEnum(IssueStatus)
})
