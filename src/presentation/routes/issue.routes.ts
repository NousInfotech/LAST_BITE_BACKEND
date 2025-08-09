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
// Protected Routes (users can create issues)
// ------------------------------
issueRouter.use(authMiddleware(["user", "rider", "restaurantAdmin", "superAdmin", "martStoreAdmin"]));

// Create a new issue (users can create help queries)
issueRouter.post("/", IssueController.createIssue);

// ------------------------------
// Protected Routes (superAdmin only)
// ------------------------------
issueRouter.use(authMiddleware(["superAdmin"]));

// Update an existing issue
issueRouter.put("/:issueId", IssueController.updateIssue);

// Change status of an issue
issueRouter.patch("/:issueId/status", IssueController.changeIssueStatus);

// Delete an issue
issueRouter.delete("/:issueId", IssueController.deleteIssue);

export default issueRouter;
