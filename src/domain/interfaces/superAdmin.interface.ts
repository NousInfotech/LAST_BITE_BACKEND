// interfaces/superAdmin.interface.ts
export interface ISuperAdmin {
    superAdminId?: string;
    name: string;
    email: string;
    password: string;
    role: "superAdmin";
}
