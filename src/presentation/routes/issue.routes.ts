import { Router } from "express";
import { IssueController } from "../controllers/issue.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const issueRouter = Router();

// ------------------------------
// Public Routes
// ------------------------------

// List all issues (supports query filters)
issueRouter.get("/", IssueController.getAllIssues);

// Get all issues raised by a specific user
issueRouter.get("/raisedBy/:raisedById", IssueController.getIssuesByRaisedBy);

// Get all issues against a specific target
issueRouter.get("/target/:targetId", IssueController.getIssuesAgainstTarget);

// Get single issue by ID (keep LAST to avoid matching above routes)
issueRouter.get("/:issueId", IssueController.getIssueById);

// ------------------------------
// Protected Routes (superAdmin or relevant roles)
// ------------------------------
issueRouter.use(authMiddleware(["superAdmin"]));

// Create a new issue
issueRouter.post("/", IssueController.createIssue);

// Update an existing issue
issueRouter.put("/:issueId", IssueController.updateIssue);

// Change status of an issue
issueRouter.patch("/:issueId/status", IssueController.changeIssueStatus);

// Delete an issue
issueRouter.delete("/:issueId", IssueController.deleteIssue);

export default issueRouter;
