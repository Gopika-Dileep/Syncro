import { z } from 'zod';

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

export const AddEmployeeRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    designation: z.string().optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be 10 digits')
      .optional(),
    address: z.string().optional(),
    skills: z.array(z.string()).optional(),
    date_of_joining: z.string().optional(),
    date_of_birth: z.string().optional(),
    team_id: z.string().optional(),
    permissions: EmployeePermissionsSchema,
  }),
});

export const UpdateEmployeeRequestSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    designation: z.string().optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/)
      .optional(),
    address: z.string().optional(),
    skills: z.array(z.string()).optional(),
    date_of_birth: z.string().optional(),
    date_of_joining: z.string().optional(),
    team_id: z.string().optional(),
    permissions: EmployeePermissionsSchema.partial().optional(),
  }),
});

export const GetEmployeesRequestSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(5),
    search: z.string().default(''),
  }),
});

export type EmployeePermissionsDTO = z.infer<typeof EmployeePermissionsSchema>;
export type GetEmployeesRequestDTO = z.infer<typeof GetEmployeesRequestSchema>['query'];
export type AddEmployeeRequestDTO = z.infer<typeof AddEmployeeRequestSchema>['body'];
export type UpdateEmployeeRequestDTO = z.infer<typeof UpdateEmployeeRequestSchema>['body'];

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
  team?: {
    _id: string;
    name: string;
  };
  designation?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  date_of_joining?: string;
  date_of_birth?: string;
  permissions?: EmployeePermissionsDTO;
  created_at: string;
}

export interface PaginatedEmployeeResponseDTO {
  employees: EmployeeResponseDTO[];
  total: number;
}
