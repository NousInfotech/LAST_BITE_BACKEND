## 🛠 **Issue API**

**Base URL:** `/api/issues`

---

### 🔓 Public Routes

#### **GET /** — Get all issues

Fetches the complete list of issues.

Supports optional query filters such as `status`, `raisedById`, `targetId`, etc.

#### **GET /raisedBy/:raisedById** — Get issues by reporter

**Path Parameter:**

* `raisedById`: ID of the user who created/reported the issues.

Returns all issues raised by the specified user.

#### **GET /target/:targetId** — Get issues against a target

**Path Parameter:**

* `targetId`: ID of the entity the issues are against (e.g., a restaurant, user, order, etc.).

Returns all issues reported against the specified target.

#### **GET /:issueId** — Get an issue by ID

**Path Parameter:**

* `issueId`: Unique identifier of the issue.

Returns details of a single issue by its unique identifier.

---

### 🔐 Protected Routes (`superAdmin`, `supportAdmin`)

#### **POST /** — Create an issue

**Request Body:**

* `title` — Short title/summary of the issue (string, required)
* `description` — Detailed description (string, required)
* `raisedBy` — ID of the user creating the issue (string, required)
* `targetId` — ID of the entity the issue is against (string, required)
* `status` — *(optional)* Status of the issue (`OPEN`, `IN_REVIEW`, `RESOLVED`, `REJECTED`). Defaults to `OPEN` when not provided.

Creates a new issue entry in the system.

#### **PUT /:issueId** — Update an issue

**Path Parameter:**

* `issueId`: Unique identifier of the issue.

**Request Body:**

Any updatable fields (`title`, `description`, `targetId`, `status`).

Updates the specified issue.

#### **PATCH /:issueId/status** — Change issue status

**Path Parameter:**

* `issueId`: Unique identifier of the issue.

**Request Body:**

* `status`: One of `OPEN`, `PENDING`, `IN_REVIEW`, `RESOLVED`, `REJECTED`.

Updates only the `status` field of the issue.

#### **DELETE /:issueId** — Delete an issue

Deletes the issue with the given ID. Requires admin permissions.

---

## ✅ Authentication & Authorization

* **Protected routes** require JWT authentication and specific roles.
* Only `superAdmin` can create, update, delete, or change status.
* Public routes allow viewing and filtering issues.

---

## 🏷️ Issue Status Reference

Possible values for `status`:

* `OPEN` — Newly created issue, awaiting action (default).
* `PENDING` — Awaiting initial acknowledgment or triage.
* `IN_REVIEW` — Currently being investigated.
* `RESOLVED` — Issue fixed/addressed.
* `REJECTED` — Marked as invalid or not actionable.