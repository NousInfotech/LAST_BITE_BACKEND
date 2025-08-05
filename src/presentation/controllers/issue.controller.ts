import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { IssueUseCase } from "../../application/use-cases/issue.useCase.js";
import {
    issueSchema,
    updateIssueSchema,
    issueIdParamsSchema,
    changeIssueStatusSchema,
    raisedByIdParamsSchema,
    targetIdParamsSchema
} from "../validators/issue.validator.js";

export const IssueController = {
    async createIssue(req: Request, res: Response) {
        const validated = validate(issueSchema, req.body, res);
        if (!validated) return;

        return tryCatch(res, async () => {
            const issue = await IssueUseCase.createIssue(validated);
            return sendResponse(res, HTTP.CREATED, "Issue created successfully", issue);
        });
    },

    async getIssueById(req: Request, res: Response) {
        const parsed = validate(issueIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { issueId } = parsed;

        return tryCatch(res, async () => {
            const issue = await IssueUseCase.findIssueById(issueId);
            if (!issue) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue fetched successfully", issue);
        });
    },

    async updateIssue(req: Request, res: Response) {
        const paramCheck = validate(issueIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateIssueSchema, req.body, res);
        if (!bodyCheck) return;

        const { issueId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await IssueUseCase.updateIssue(issueId, bodyCheck);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue updated successfully", updated);
        });
    },

    async deleteIssue(req: Request, res: Response) {
        const parsed = validate(issueIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { issueId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await IssueUseCase.deleteIssue(issueId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue deleted successfully", deleted);
        });
    },

    async getAllIssues(req: Request, res: Response) {
        const filters = req.query;
        return tryCatch(res, async () => {
            const issues = await IssueUseCase.getAllIssues(filters);
            if (!issues || issues.length === 0) {
                sendError(res, HTTP.NOT_FOUND, "No issues found");
                return;
            }
            return sendResponse(res, HTTP.OK, "Issues fetched successfully", issues);
        });
    },

    async getIssuesByRaisedBy(req: Request, res: Response) {
        const parsed = validate(raisedByIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { raisedById } = parsed;

        return tryCatch(res, async () => {
            const issues = await IssueUseCase.getIssuesByRaisedBy(raisedById);
            return sendResponse(res, HTTP.OK, "Issues fetched successfully", issues || []);
        });
    },

    async getIssuesAgainstTarget(req: Request, res: Response) {
        const parsed = validate(targetIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { targetId } = parsed;

        return tryCatch(res, async () => {
            const issues = await IssueUseCase.getIssuesAgainstTarget(targetId);
            return sendResponse(res, HTTP.OK, "Issues fetched successfully", issues || []);
        });
    },

    async changeIssueStatus(req: Request, res: Response) {
        const paramCheck = validate(issueIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(changeIssueStatusSchema, req.body, res);
        if (!bodyCheck) return;

        const { issueId } = paramCheck;
        const { status } = bodyCheck;

        return tryCatch(res, async () => {
            const updated = await IssueUseCase.changeIssueStatus(issueId, status);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue status updated successfully", updated);
        });
    }
};
