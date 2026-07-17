import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const INCOTERMS = ["FOB", "CIF", "EXW", "DDP"] as const;
export const QUANTITY_UNITS = ["MT", "KG", "units"] as const;

export const rfqCompanySchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required"),
  contactName: z.string().trim().min(2, "Contact name is required"),
  email: z.string().trim().email("Enter a valid business email"),
  whatsapp: z.string().refine((v) => isValidPhoneNumber(v ?? ""), "Enter a valid WhatsApp number"),
  importCountry: z.string().trim().min(2, "Country of import is required"),
});

export const rfqProductSchema = z.object({
  destinationPort: z.string().trim().min(2, "Destination port is required"),
  categoryKey: z.string().min(1, "Select a product category"),
  hsCode: z.string().trim().min(4, "HS code is required"),
  quantity: z.coerce.number().positive("Enter a quantity greater than 0"),
  unit: z.enum(QUANTITY_UNITS),
  priceBand: z.string().trim().optional(),
});

export const rfqTermsSchema = z.object({
  incoterm: z.enum(INCOTERMS),
  deliveryStart: z.string().min(1, "Select a start date"),
  deliveryEnd: z.string().min(1, "Select an end date"),
  sampleRequired: z.enum(["yes", "no"]),
  notes: z.string().trim().optional(),
});

export const rfqSchema = rfqCompanySchema
  .merge(rfqProductSchema)
  .merge(rfqTermsSchema)
  .refine((data) => new Date(data.deliveryEnd) >= new Date(data.deliveryStart), {
    message: "Delivery window end must be on or after the start date",
    path: ["deliveryEnd"],
  });

export type RfqInput = z.infer<typeof rfqSchema>;
