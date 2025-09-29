import z from "zod";

export const CompanySchema = z.object({
  id: z.cuid(),
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.email("Email invalide").nullable().optional(),
  currency: z.string().nullable().optional(),
  logo: z.url("URL de logo invalide").nullable().optional(),
  payPeriodType: z.enum(["MONTHLY", "WEEKLY", "DAILY"], {
    message: "Le type de période de paie est invalide",
  }),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCompanySchema = CompanySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

export type Company = z.infer<typeof CompanySchema>;
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;