import z from "zod";

export const EmployeeSchema = z.object({
  id: z.cuid(),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  email: z.email("Email invalide").nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contractType: z.enum(["DAILY", "FIXED", "HONORARIUM"], {
    message: "Le type de contrat est invalide",
  }),
  position: z.string().nullable().optional(),
  dailyRate: z
    .number()
    .min(0, "Le taux journalier doit être un nombre positif")
    .nullable()
    .optional(),
  fixedSalary: z
    .number()
    .min(0, "Le salaire fixe doit être un nombre positif")
    .nullable()
    .optional(),
  hourlyRate: z
    .number()
    .min(0, "Le taux horaire doit être un nombre positif")
    .nullable()
    .optional(),
  bankName: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  isActive: z.boolean().default(true),

  hireDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  companyId: z.string().min(1, "L'ID de l'entreprise est requis"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateEmployeeSchema = EmployeeSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
});

export const UpdateEmployeeSchema = EmployeeSchema.partial();

export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;