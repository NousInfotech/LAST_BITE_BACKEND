import { FilterQuery, UpdateQuery } from "mongoose";
import { IIssue } from "../../domain/interfaces/issue.interface.js";
import { IssueModel, IssueDoc } from "../db/mongoose/schemas/issue.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";

export class IssueRepository {
    async createIssue(issue: IIssue) {
        const newIssue = new IssueModel(issue);
        return await newIssue.save();
    }

    async findByIssueId(issueId: string) {
        return await IssueModel.findOne({ issueId }, { _id: 0, __v: 0 }).lean();
    }

    async updateIssue(issueId: string, updateData: UpdateQuery<IIssue>) {
        return await IssueModel.findOneAndUpdate({ issueId }, updateData, { new: true }).lean();
    }

    /**
       * Get all issues with optional filters, pagination, and search
       * @param {FilterQuery<IIssue> & Record<string, any>} filter - Mongoose filter object with optional search, sortBy, page, limit
       * @returns {Promise<IssueDoc[]>}
       */
    async getAllIssues(filter: FilterQuery<IIssue> & Record<string, any> = {}): Promise<IssueDoc[]> {
        const { sortBy, order, page, limit, search, ...pureFilter } = filter;

        // Optional search on description
        if (search) {
            pureFilter.description = { $regex: search, $options: "i" };
        }

        const queryOptions = extractQueryOptions({ sortBy, order, page, limit });

        return await IssueModel.find(pureFilter, { _id: 0, __v: 0 })
            .sort(queryOptions.sort)
            .skip(queryOptions.skip || 0)
            .limit(queryOptions.limit || 10)
            .lean();
    }

    async deleteIssue(issueId: string) {
        return await IssueModel.findOneAndDelete({ issueId });
    }

    async getIssuesByRaisedBy(raisedById: string) {
        return await IssueModel.find({ raisedById }, { _id: 0, __v: 0 }).lean();
    }

    async getIssuesAgainstTarget(targetId: string) {
        return await IssueModel.find({ targetId }, { _id: 0, __v: 0 }).lean();
    }

    async updateIssueStatus(issueId: string, status: string) {
        return await IssueModel.findOneAndUpdate(
            { issueId },
            { $set: { status } },
            { new: true }
        ).lean();
    }

}
