import { z } from "zod";

export const RegisterSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string().optional().nullable(),
  student_id: z.string(),
  batch: z.number(),
  department: z.enum([
    "CSE", "EEE", "ME", "CE", "BME", "ChE", "MME", "IPE", "NCE", "NAME", "WRE", "ARC", "URP"
  ]),
  email: z.string().email(),
  phone: z.string(),
  password: z.string(),
  date_of_birth: z
    .string()
    .regex(/^(?:(?:19|20)\d\d)-(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2\d|3[01])$/, "Must be in YYYY-MM-DD format"),
  gender: z.enum(["Male", "Female"]),
  residence_type: z.enum(["Resident", "Attached"]),
  hall: z.enum(["AUH", "SWH", "SBH", "TH", "RH", "NH", "ShH", "SoH", "KNIH"]),
  room_no: z.string().optional(),
  city_name: z.string(),
});
