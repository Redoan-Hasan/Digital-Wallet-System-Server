import { z } from "zod";
import { AgentStatus, Role, Status } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string("Password is required")
    .min(6, { message: "Password must be at least 6 characters." }),
  pin: z
    .string("Pin is required")
    .min(4, { message: "Pin must be at least 4 characters." }),
});

export const updateUserZodSchema = z.object({
  name: z.string().min(1).optional(), 
  email: z.email().optional(), 
  password: z.string().min(6).optional(), 
  pin: z.string().min(4).optional(), 
  role: z.enum([Role.ADMIN, Role.USER, Role.AGENT]).optional(), 
  status: z.enum([Status.ACTIVE, Status.BLOCKED]).optional(), 
  agentStatus: z.enum([AgentStatus.PENDING, AgentStatus.APPROVED, AgentStatus.SUSPEND]).optional(), 
});
