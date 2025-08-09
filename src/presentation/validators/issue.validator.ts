import { z } from "zod";
import { issueStatusSchema, issueZodSchema } from "../../domain/zod/issue.zod.js";

// Full schema for creation
export const issueSchema = issueZodSchema;

// Partial schema for updates
export const updateIssueSchema = issueSchema.partial();

// Params validator for :issueId in routes
export const issueIdParamsSchema = z.object({
  issueId: z.string().min(1, "issueId is required"),
});

export const raisedByIdParamsSchema = z.object({
    raisedById:z.string().min(1,"id of who raised the issue is important")
})
export const targetIdParamsSchema = z.object({
    targetId:z.string().min(1,"id of who raised the issue is important")
})

// Array validator for bulk fetch (optional, if needed)
export const issueIdArraySchema = z.object({
  issueIds: z.array(
    issueIdParamsSchema.shape.issueId
  ).min(1, "At least one issueId is required"),
});

// For change status request
export const changeIssueStatusSchema = issueStatusSchema