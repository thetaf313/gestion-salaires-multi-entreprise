import z from "zod";

export const EmployeeSchema = z.object({
  id: z.cuid(),
  employeeCode: z.string().min(1, "Le code employé est requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  email: z.string().email("Email invalide").min(1, "L'email est requis"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  address: z.string().nullable().optional(),
  contractType: z.enum(["DAILY", "FIXED", "HONORARIUM"], {
    message: "Le type de contrat est invalide",
  }),
  position: z.string().min(1, "Le poste est requis"),
  dailyRate: z
    .union([
      z.number().min(0, "Le taux journalier doit être un nombre positif"),
      z
        .string()
        .regex(
          /^\d+(\.\d{1,2})?$/,
          "Le taux journalier doit être un nombre valide avec maximum 2 décimales"
        )
        .refine(
          (val) => parseFloat(val) >= 0,
          "Le taux journalier doit être positif"
        ),
      z.literal("").transform(() => null),
    ])
    .nullable()
    .optional(),
  fixedSalary: z
    .union([
      z.number().min(0, "Le salaire fixe doit être un nombre positif"),
      z
        .string()
        .regex(
          /^\d+(\.\d{1,2})?$/,
          "Le salaire fixe doit être un nombre valide avec maximum 2 décimales"
        )
        .refine(
          (val) => parseFloat(val) >= 0,
          "Le salaire fixe doit être positif"
        ),
      z.literal("").transform(() => null),
    ])
    .nullable()
    .optional(),
  hourlyRate: z
    .union([
      z.number().min(0, "Le taux horaire doit être un nombre positif"),
      z
        .string()
        .regex(
          /^\d+(\.\d{1,2})?$/,
          "Le taux horaire doit être un nombre valide avec maximum 2 décimales"
        )
        .refine(
          (val) => parseFloat(val) >= 0,
          "Le taux horaire doit être positif"
        ),
      z.literal("").transform(() => null),
    ])
    .nullable()
    .optional(),
  bankName: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  isActive: z.boolean().default(true),

  hireDate: z.date({
    message: "La date d'embauche est requise et doit être une date valide",
  }),
  endDate: z.date().nullable().optional(),
  companyId: z.string().min(1, "L'ID de l'entreprise est requis"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateEmployeeSchema = EmployeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  employeeCode: true, // Le code employé est optionnel lors de la création (auto-généré)
});

export const UpdateEmployeeSchema = EmployeeSchema.partial();

export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
