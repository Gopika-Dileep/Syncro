import { z } from 'zod'
import { EmployeePermissions } from './employee.dto';

export const ChangePasswordRequestSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "current password is required"),
        newPassword: z.string().min(6, "new password must be at least 6 characters"),
    }),
});

export const UpdateProfileRequestSchema = z.object({
    body: z.object({
        name: z.string().min(2, "name must be at least 2 characters").optional(),
        email: z.string().email("Invalid mail format").optional(),
        phone: z.string().regex(/^\d{10}$/, "phone must be 10 digits").optional(),
        address: z.string().optional(),
        skills: z.array(z.string()).optional(),
    }),
});

export type ChangePasswordRequestDTO = z.infer<typeof ChangePasswordRequestSchema>['body']
export type UpdateProfileRequestDTO = z.infer<typeof UpdateProfileRequestSchema>["body"]

export interface CompanyProfileDTO {
    _id: string;
    name: string;
    about_us?: string | null;
}

export interface EmployeeProfileDTO {
    _id: string;
    designation?: string;
    phone?: string;
    address?: string;
    skills?: string[];
    date_of_joining?: string;
    date_of_birth?: string;
    permissions?: EmployeePermissions;
}

export interface UserProfileResponseDTO {
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar: string | null;
        created_at: string | Date;
    };
    company?: CompanyProfileDTO | null;
    employee?: EmployeeProfileDTO | null;
}