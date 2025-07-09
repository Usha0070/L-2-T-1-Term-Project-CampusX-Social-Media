import { z } from "zod";

export const LoginSchema = z.object({
  student_id: z.string()
    .min(1, "Student ID is required")
    .regex(/^\d+$/, "Student ID must be a number string"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
