# 🍽️ Last_bite Backend

Backend service for the **Last_bite** platform, built with Node.js and Express using TypeScript. It manages user data, authentication (via Twilio), and MongoDB integration.

---

## ⚙️ Tech Stack

- Node.js (v20.14.0)
- Express.js
- TypeScript
- MongoDB
- Twilio
- dotenv

---

## 🧬 Environment Configuration

Environment variables are managed via the `src/config/env.ts` file. This file pulls from your local `.env`.

### 📝 .env Example:

```env
PORT=your_custom_port
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret
```

---

## 🚀 Installation

```bash
# Clone the repo
git clone https://github.com/your-org/last_bite_backend.git
cd last_bite_backend

# Install dependencies
npm install
```

---

## 🔧 Run the App

### Development
```bash
npm run dev
```

---

## 📁 Folder Structure

```
last_bite_backend/
├── node_modules/              // Installed packages (ignored in version control)
├── docs/                      // Documentation files (if any)
├── .gitignore                 // gitIgnore file
├── .env                       // Environmental Variables
├── package.json               // NPM scripts and dependencies
├── package-lock.json          // Dependency tree lock
├── tsconfig.json              // TypeScript configuration
├── README.md                  // Project documentation
│
└── src/
    ├── app.ts                 // Express app configuration
    ├── index.ts               // Server entry point
    │
    ├── application/           // Business logic layer
    │   └── use-cases/         // e.g., user-related core use case functions
    │
    ├── config/                // App configuration settings
    │   ├── env.ts             // Environment variables config using dotenv
    │   └── jwt.config.ts       // JWT Config File  
    │
    ├── domain/                // Core domain logic and validation
    │   ├── interfaces/        // Type definitions and contracts
    │   │   └── user.interface.ts  // Example: defines shape of a user object
    │   └── zod/               // Zod schemas for input validation
    │       └── user.zod.ts        // Example: validates user input
    │
    ├── infrastructure/        // Handles persistence and database
    │   ├── db/                // DB connection and setup
    │   │   ├── mongoose/
    │   │   │   ├── connection.ts      // MongoDB connection logic
    │   │   │   └── schemas/          // Mongoose schema definitions
    │   │   │       └── user.schema.ts
    │   │   └── seed/                // Seed data folder (optional)
    │   └── repositories/            // Data access layer
    │       └── user.repository.ts   // Example repository for users
    │
    ├── middleware/            // Express middleware
    │   └── authMiddleware.ts  // Checks JWT authentication
    │
    ├── presentation/          // Route handling and controllers
    │   ├── controllers/       // Functions to handle requests
    │   │   └── user.controller.ts
    │   ├── routes/            // Route definitions
    │   │   └── user.routes.ts
    │   └── validators/        // Validates incoming payloads
    │       └── user.validator.ts
    │
    └── utils/                 // Utility functions
        ├── addCustomIdHook.ts    // Adds custom ID to schemas
        ├── constants.ts          // Shared constants
        ├── sendError.ts          // Standard error response
        ├── sendResponse.ts       // Structured success response
        └── validation.ts         // Common validation utilities
        └── ...
```

---

## 👨‍💻 Maintainers

- [Akram-00](https://github.com/Akram-00)

---

