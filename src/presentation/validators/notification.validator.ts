import { z } from "zod";
// Create a literal union from RoleEnum manually for allowed roles
const AllowedTargetRoles = z.enum(["user", "restaurantAdmin"]);

export const targetRoleAndIdValidator = z.object({
  targetRole: AllowedTargetRoles, // only allows 'user' or 'restaurantAdmin'
  targetRoleId: z.string().min(1, "Target role ID is required"),
});

export const notificationIdValidator = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});
