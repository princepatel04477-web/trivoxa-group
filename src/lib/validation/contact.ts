import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  companyName: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().min(5, "Tell us a bit about your inquiry"),
});

export type ContactInput = z.infer<typeof contactSchema>;
