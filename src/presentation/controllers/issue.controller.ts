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
import { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { RoleEnum } from "../../domain/interfaces/utils.interface.js";

export const IssueController = {
    async createIssue(req: AuthenticatedRequest, res: Response) {
        const validated = validate(issueSchema, req.body, res);
        if (!validated) return;

        return tryCatch(res, async () => {
            // Get the authenticated user's ID based on their role
            let raisedById = '';
            let raisedByRole: RoleEnum;

            if (req.userId) {
                raisedById = req.userId;
                raisedByRole = RoleEnum.user;
            } else if (req.restaurantAdminId) {
                raisedById = req.restaurantAdminId;
                raisedByRole = RoleEnum.restaurantAdmin;
            } else if (req.riderId) {
                raisedById = req.riderId;
                raisedByRole = RoleEnum.rider;
            } else if (req.superAdminId) {
                raisedById = req.superAdminId;
                raisedByRole = RoleEnum.superAdmin;
            } else if (req.martStoreAdminId) {
                raisedById = req.martStoreAdminId;
                raisedByRole = RoleEnum.martStoreAdmin;
            } else {
                return sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: No valid user ID found");
            }

            // Create the complete issue data with all required fields
            const issueData = {
                ...validated,
                raisedById,
                raisedByRole,
                tags: validated.tags || [],
                description: validated.description,
                targetRole: validated.targetRole,
                targetId: validated.targetId
            };

            const issue = await IssueUseCase.createIssue(issueData);
            return sendResponse(res, HTTP.CREATED, "Issue created successfully", issue);
        });
    },

    async getIssueById(req: Request, res: Response) {
        const parsed = validate(issueIdParamsSchema, req.params, res);
        if (!parsed) return;

        return tryCatch(res, async () => {
            const issue = await IssueUseCase.findIssueById(parsed.issueId);
            if (!issue) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue fetched successfully", issue);
        });
    },

    async updateIssue(req: Request, res: Response) {
        const paramCheck = validate(issueIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateIssueSchema, req.body, res);
        if (!bodyCheck) return;

        return tryCatch(res, async () => {
            const updated = await IssueUseCase.updateIssue(paramCheck.issueId, bodyCheck);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue updated successfully", updated);
        });
    },

    async deleteIssue(req: Request, res: Response) {
        const parsed = validate(issueIdParamsSchema, req.params, res);
        if (!parsed) return;

        return tryCatch(res, async () => {
            const deleted = await IssueUseCase.deleteIssue(parsed.issueId);
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

        return tryCatch(res, async () => {
            const issues = await IssueUseCase.getIssuesByRaisedBy(parsed.raisedById);
            return sendResponse(res, HTTP.OK, "Issues fetched successfully", issues || []);
        });
    },

    async getIssuesAgainstTarget(req: Request, res: Response) {
        const parsed = validate(targetIdParamsSchema, req.params, res);
        if (!parsed) return;

        return tryCatch(res, async () => {
            const issues = await IssueUseCase.getIssuesAgainstTarget(parsed.targetId);
            return sendResponse(res, HTTP.OK, "Issues fetched successfully", issues || []);
        });
    },

    async changeIssueStatus(req: Request, res: Response) {
        const paramCheck = validate(issueIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(changeIssueStatusSchema, req.body, res);
        if (!bodyCheck) return;

        return tryCatch(res, async () => {
            const updated = await IssueUseCase.changeIssueStatus(paramCheck.issueId, bodyCheck.status);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Issue not found");
            return sendResponse(res, HTTP.OK, "Issue status updated successfully", updated);
        });
    }
};
