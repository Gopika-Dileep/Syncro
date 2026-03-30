import { z } from "zod";

// --- PERMISSIONS SCHEMA ---
export const EmployeePermissionsSchema = z.object({
  project: z.object({
    create: z.boolean(),
    view: z.object({ team: z.boolean(), all: z.boolean() }),
    update: z.object({ team: z.boolean(), all: z.boolean() }),
    delete: z.boolean(),
  }),
  task: z.object({
    create: z.boolean(),
    view: z.object({ team: z.boolean(), all: z.boolean() }),
    assign: z.object({ team: z.boolean(), all: z.boolean() }),
    update: z.object({ team: z.boolean(), all: z.boolean() }),
  }),
  sprint: z.object({
    create: z.boolean(),
    view: z.object({ all: z.boolean() }),
    update: z.boolean(),
    start: z.boolean(),
    complete: z.boolean(),
  }),
  userStory: z.object({
    create: z.boolean(),
    view: z.object({ all: z.boolean() }),
    update: z.boolean(),
    assign: z.boolean(),
  }),
  team: z.object({
    view: z.object({ team: z.boolean(), all: z.boolean() }),
    performance: z.object({ team: z.boolean(), all: z.boolean() }),
  }),
});

// --- REQUEST SCHEMAS ---
export const AddEmployeeRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    designation: z.string().optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits").optional(),
    address: z.string().optional(),
    skills: z.array(z.string()).optional(),
    date_of_joining: z.string().optional(),
    date_of_birth: z.string().optional(),
    permissions: EmployeePermissionsSchema,
  }),
});

export const UpdateEmployeeRequestSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    designation: z.string().optional(),
    phone: z.string().regex(/^\d{10}$/).optional(),
    address: z.string().optional(),
    skills: z.array(z.string()).optional(),
    date_of_birth: z.string().optional(),
    date_of_joining: z.string().optional(),
    permissions: EmployeePermissionsSchema.partial().optional(),
  }),
});

export const GetEmployeesRequestSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(5),
    search: z.string().default(""),
  }),
});

// --- DTO TYPES (Inferred from Zod) ---

export type EmployeePermissions = z.infer<typeof EmployeePermissionsSchema>;
export type GetEmployeesRequest = z.infer<typeof GetEmployeesRequestSchema>["query"];
export type AddEmployeeRequest = z.infer<typeof AddEmployeeRequestSchema>["body"];
export type UpdateEmployeeRequest = z.infer<typeof UpdateEmployeeRequestSchema>["body"];

// --- RESPONSE DTOS ---

export interface EmployeeResponseDTO {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    is_blocked: boolean;
  };
  company_id: {
    _id: string;
    name: string;
  };
  team_id?: string;
  designation?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  date_of_joining?: string;
  date_of_birth?: string;
  permissions?: z.infer<typeof EmployeePermissionsSchema>;
  created_at: string;
}

export interface PaginatedEmployeeResponseDTO {
  employees: EmployeeResponseDTO[];
  total: number;
}
