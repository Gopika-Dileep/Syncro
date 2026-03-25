
import { z } from "zod";


export const loginSchema = z.object({
  email: z.string().email("Please enter a valid work email").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name can't exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Numbers and special characters aren't allowed in names"),
  email: z.string().email("Please provide a valid work email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Include at least one capital letter")
    .regex(/[0-9]/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
  companyName: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(50, "Company name can't exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Numbers and special characters aren't allowed in company names"),
});


export const employeeSchema = z.object({
  name: z.string()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),
  email: z.string().email("Please enter a valid work email"),
  designation: z.string()
    .min(1, "Designation is required")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  date_of_joining: z.string().min(1, "Joining date is required"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "Numeric digits only"),
});


export const getZodError = (error: unknown): string | null => {
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    return firstIssue ? firstIssue.message : null;
  }
  return null;
};

export const getZodErrors = (error: unknown): Record<string, string> => {
  if (error instanceof z.ZodError) {
    return error.issues.reduce((acc, curr) => {
      const field = curr.path[0] as string;
      if (!acc[field]) acc[field] = curr.message;
      return acc;
    }, {} as Record<string, string>);
  }
  return {};
};


export type EmployeeformInput = z.infer<typeof employeeSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Include at least one capital letter")
    .regex(/[0-9]/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name can't exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Numbers and special characters aren't allowed"),
  email: z.string().email("Please provide a valid work email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal("")),
  address: z.string().max(200, "Address is too long").optional().or(z.literal("")),
  skills: z.array(z.string()).optional(),
});

export const resetPasswordSchema = z.object({
    newPassword: z.string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Include at least one capital letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
