import { IIssue, IssueStatus } from "../../domain/interfaces/issue.interface.js";
import { IssueRepository } from "../../infrastructure/repositories/issue.repository.js";
import { UpdateQuery, FilterQuery } from "mongoose";
import { RoleEnum } from "../../domain/interfaces/utils.interface.js";
import { sendUserNotification } from "../../presentation/sockets/userNotification.socket.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";

const issueRepo = new IssueRepository();

export const IssueUseCase = {
    // Create Issue with default OPEN status
    createIssue: async (data: Omit<IIssue, "status"> & { raisedByRole?: RoleEnum; raisedById?: string }) => {
        const issueData: IIssue = {
            ...data,
            status: IssueStatus.OPEN,
            raisedByRole: data.raisedByRole as RoleEnum,
            raisedById: data.raisedById || ''
        };
        const created = await issueRepo.createIssue(issueData);
        try {
            // Notify the target if provided
            if (created.targetRole === 'restaurant' && created.targetId) {
                sendRestaurantNotification(created.targetId, {
                    type: 'system',
                    targetRole: 'restaurantAdmin',
                    targetRoleId: created.targetId,
                    message: `New issue raised`,
                    emoji: '🛠️',
                    theme: 'warning',
                    metadata: { issueId: created.issueId }
                } as any);
            } else if (created.targetRole === 'user' && created.targetId) {
                sendUserNotification(created.targetId, {
                    type: 'system',
                    targetRole: 'user',
                    targetRoleId: created.targetId,
                    message: `We received your issue`,
                    emoji: '📩',
                    theme: 'info',
                    metadata: { issueId: created.issueId }
                } as any);
            }
        } catch {}
        return created;
    },

    findIssueById: async (issueId: string) => {
        return await issueRepo.findByIssueId(issueId);
    },

    updateIssue: async (issueId: string, updateData: UpdateQuery<IIssue>) => {
        const updated = await issueRepo.updateIssue(issueId, updateData);
        try {
            if (updated?.raisedByRole === RoleEnum.user && updated.raisedById) {
                sendUserNotification(updated.raisedById, {
                    type: 'system',
                    targetRole: 'user',
                    targetRoleId: updated.raisedById,
                    message: `Issue updated`,
                    emoji: '🔄',
                    theme: 'info',
                    metadata: { issueId }
                } as any);
            }
        } catch {}
        return updated;
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
        const updated = await issueRepo.updateIssueStatus(issueId, status);
        try {
            if (updated?.raisedByRole === RoleEnum.user && updated.raisedById) {
                sendUserNotification(updated.raisedById, {
                    type: 'system',
                    targetRole: 'user',
                    targetRoleId: updated.raisedById,
                    message: `Issue ${status.toLowerCase()}`,
                    emoji: '📣',
                    theme: status === IssueStatus.RESOLVED ? 'success' : 'info',
                    metadata: { issueId }
                } as any);
            }
        } catch {}
        return updated;
    }
};
