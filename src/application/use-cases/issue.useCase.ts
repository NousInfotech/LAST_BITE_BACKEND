import { IIssue, IssueStatus } from "../../domain/interfaces/issue.interface.js";
import { IssueRepository } from "../../infrastructure/repositories/issue.repository.js";
import { UpdateQuery, FilterQuery } from "mongoose";

const issueRepo = new IssueRepository();

export const IssueUseCase = {
    // Create Issue with default OPEN status
    createIssue: async (data: Omit<IIssue, "status">) => {
        const issueData: IIssue = {
            ...data,
            status: IssueStatus.OPEN
        };
        return await issueRepo.createIssue(issueData);
    },

    findIssueById: async (issueId: string) => {
        return await issueRepo.findByIssueId(issueId);
    },

    updateIssue: async (issueId: string, updateData: UpdateQuery<IIssue>) => {
        return await issueRepo.updateIssue(issueId, updateData);
    },

    getAllIssues: async (filter: FilterQuery<IIssue> & Record<string, any> = {}) => {
        return await issueRepo.getAllIssues(filter);
    },

    deleteIssue: async (issueId: string) => {
        return await issueRepo.deleteIssue(issueId);
    },

    getIssuesByRaisedBy: async (raisedById: string) => {
        return await issueRepo.getIssuesByRaisedBy(raisedById);
    },

    getIssuesAgainstTarget: async (targetId: string) => {
        return await issueRepo.getIssuesAgainstTarget(targetId);
    },

    changeIssueStatus: async (issueId: string, status: IIssue["status"]) => {
        return await issueRepo.updateIssueStatus(issueId, status);
    }
};
