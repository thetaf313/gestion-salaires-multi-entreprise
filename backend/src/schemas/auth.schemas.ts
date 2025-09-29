import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string({ message: 'Le mot de passe est requis' }).min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const registerSchema = z.object({
  nom: z.string({ message: 'Le nom est requis' }).min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom doit contenir au maximum 50 caractères'),
  prenom: z.string({ message: 'Le prénom est requis' }).min(2, 'Le prénom doit contenir au moins 2 caractères').max(50, 'Le prénom doit contenir au maximum 50 caractères'),
  email: z.email('Email invalide'),
  password: z.string({ message: 'Le mot de passe est requis' }).min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string({ message: 'La confirmation du mot de passe est requise' }).min(8, 'La confirmation du mot de passe doit contenir au moins 8 caractères'),
  role: z.enum(['USER', 'ADMIN'], { message: 'Rôle invalide' }),
}).refine(
  (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  }
);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;