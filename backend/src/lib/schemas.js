const { z } = require("zod");

// employee schemas

const createEmployeeSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  role: z
    .string({ required_error: "Role is required" })
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be under 100 characters")
    .trim(),

  department: z
    .string()
    .min(2, "Department must be at least 2 characters")
    .max(100)
    .trim()
    .optional()
    .default("General"),

  phone: z
    .string()
    .regex(/^[+\d\s\-().]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),

  status: z
    .enum(["Active", "Inactive"], {
      required_error: "Status is required",
      invalid_type_error: "Status must be 'Active' or 'Inactive'",
    })
    .default("Active"),

  salary: z
    .number({ invalid_type_error: "Salary must be a number" })
    .min(0, "Salary must be positive")
    .optional(),

  joinedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .default(() => new Date().toISOString().split("T")[0]),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  role: z.string().min(2).max(100).trim().optional(),
  department: z.string().min(2).max(100).trim().optional(),
  phone: z.string().regex(/^[+\d\s\-().]*$/).optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive"]).optional(),
  salary: z.number().min(0).optional(),
  joinedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

const employeeQuerySchema = z.object({
  search: z.string().optional().default(""),
  status: z.enum(["Active", "Inactive", "All", ""]).optional().default("All"),
  department: z.string().optional().default(""),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((v) => Math.min(50, Math.max(1, parseInt(v, 10) || 10))),
  sortBy: z.enum(["name", "joinedDate", "role", "status", "department"]).optional().default("joinedDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// auth schemas

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["admin", "hr", "viewer"]).optional().default("viewer"),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  loginSchema,
  registerSchema,
};
