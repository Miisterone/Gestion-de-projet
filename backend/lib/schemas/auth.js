import { z } from 'zod';
import { name, required, zoneId } from './fields';

const email = z
  .string(required("L'email"))
  .trim()
  .toLowerCase()
  .min(1, "L'email est obligatoire.")
  .max(254, "L'email est trop long.")
  .email("L'email n'est pas valide.");

export const registerSchema = z.object({
  firstName: name('Le prénom'),
  lastName: name('Le nom'),
  email,
  password: z
    .string(required('Le mot de passe'))
    .min(6, 'Le mot de passe doit faire au moins 6 caractères.')
    // bcrypt only uses the first 72 bytes
    .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères.'),
  zoneId,
});

export const loginSchema = z.object({
  email: z.string(required("L'email")).trim().toLowerCase().min(1, "L'email est obligatoire."),
  password: z.string(required('Le mot de passe')).min(1, 'Le mot de passe est obligatoire.'),
});
