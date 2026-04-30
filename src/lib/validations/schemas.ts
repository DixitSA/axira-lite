import { z } from "zod";

// --- Client ---
export const CreateClientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().min(7, "Phone number is required").max(20),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  companyName: z.string().max(200).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type CreateClientInput = z.infer<typeof CreateClientSchema>;

// --- Job ---
export const CreateJobSchema = z.object({
  clientId: z.number().int().positive("Client is required"),
  title: z.string().min(1, "Job title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().min(1, "Address is required").max(500),
  scheduledStart: z.string().min(1, "Start date is required"),
  scheduledEnd: z.string().optional().or(z.literal("")),
  quotedAmount: z.number().min(0).optional(),
});
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

// --- Invoice ---
export const CreateInvoiceSchema = z.object({
  clientId: z.number().int().positive("Client is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
