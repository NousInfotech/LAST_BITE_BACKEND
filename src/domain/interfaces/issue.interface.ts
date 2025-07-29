import { RoleEnum } from "./utils.interface";


export enum IssueStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}
// src/domain/interfaces/issue.interface.ts
export interface IIssue {
  issueId?: string; // Optional here because Mongoose will generate it
  raisedByRole: RoleEnum;
  raisedById: string;
  targetRole: RoleEnum;
  targetId: string;
  description: string;
  relatedOrderId?: string;
  status: IssueStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
