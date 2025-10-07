import Joi from "joi";

export const generatePayslipsSchema = Joi.object({
  params: Joi.object({
    companyId: Joi.string().required().messages({
      "string.empty": "L'ID de l'entreprise est obligatoire",
      "any.required": "L'ID de l'entreprise est obligatoire",
    }),
    payRunId: Joi.string().required().messages({
      "string.empty": "L'ID du cycle de paie est obligatoire",
      "any.required": "L'ID du cycle de paie est obligatoire",
    }),
  }),
});

export const updatePayslipStatusSchema = Joi.object({
  params: Joi.object({
    companyId: Joi.string().required().messages({
      "string.empty": "L'ID de l'entreprise est obligatoire",
      "any.required": "L'ID de l'entreprise est obligatoire",
    }),
    payslipId: Joi.string().required().messages({
      "string.empty": "L'ID du bulletin de paie est obligatoire",
      "any.required": "L'ID du bulletin de paie est obligatoire",
    }),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid("PENDING", "PARTIAL", "PAID")
      .required()
      .messages({
        "string.empty": "Le statut est obligatoire",
        "any.required": "Le statut est obligatoire",
        "any.only": "Le statut doit être PENDING, PARTIAL ou PAID",
      }),
    amountPaid: Joi.number()
      .min(0)
      .when("status", {
        is: "PAID",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "Le montant payé doit être un nombre",
        "number.min": "Le montant payé doit être positif",
        "any.required": "Le montant payé est obligatoire pour un bulletin payé",
      }),
  }),
});

export const payslipSearchSchema = Joi.object({
  params: Joi.object({
    companyId: Joi.string().required(),
  }),
  query: Joi.object({
    search: Joi.string().allow("").optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid("PENDING", "PARTIAL", "PAID").optional(),
    employeeId: Joi.string().optional(),
  }),
});

export const employeePayslipsSchema = Joi.object({
  params: Joi.object({
    companyId: Joi.string().required(),
    employeeId: Joi.string().required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
});
