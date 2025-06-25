import { z } from "zod";

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Email or Student ID is required"),
  password: z.string().min(1, "Password is required"),
});
