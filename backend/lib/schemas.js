// Validation of the request bodies. Messages are shown under the fields by the front.
import { z } from 'zod';

const required = (label) => ({ required_error: `${label} est obligatoire.`, invalid_type_error: `${label} est invalide.` });

const name = (label) =>
  z
    .string(required(label))
    .trim()
    .min(1, `${label} est obligatoire.`)
    .max(50, `${label} ne doit pas dépasser 50 caractères.`);

const email = z
  .string(required("L'email"))
  .trim()
  .toLowerCase()
  .min(1, "L'email est obligatoire.")
  .max(254, "L'email est trop long.")
  .email("L'email n'est pas valide.");

const text = (label, max) =>
  z
    .string(required(label))
    .trim()
    .min(1, `${label} est vide.`)
    .max(max, `${label} ne doit pas dépasser ${max} caractères.`);

export const registerSchema = z.object({
  firstName: name('Le prénom'),
  lastName: name('Le nom'),
  email,
  password: z
    .string(required('Le mot de passe'))
    .min(6, 'Le mot de passe doit faire au moins 6 caractères.')
    // bcrypt only uses the first 72 bytes
    .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères.'),
  zoneId: z
    .number({ required_error: 'Choisissez votre quartier.', invalid_type_error: 'Choisissez votre quartier.' })
    .int('Choisissez votre quartier.')
    .positive('Choisissez votre quartier.'),
});

export const loginSchema = z.object({
  email: z.string(required("L'email")).trim().toLowerCase().min(1, "L'email est obligatoire."),
  password: z.string(required('Le mot de passe')).min(1, 'Le mot de passe est obligatoire.'),
});

export const postSchema = z.object({ content: text('La publication', 2000) });

export const commentSchema = z.object({ content: text('Le commentaire', 1000) });

export const eventSchema = z.object({
  title: text('Le titre', 100),
  description: text('La description', 1000),
  // Meeting point in free text, never a home address
  place: text('Le lieu', 100),
  startsAt: z
    .string(required('La date'))
    .datetime({ offset: true, message: "La date n'est pas valide." })
    // An unreadable date is already refused by datetime(): only report it once
    .refine((value) => Number.isNaN(Date.parse(value)) || new Date(value) > new Date(), {
      message: "La date doit être dans le futur.",
      params: { code: 'INVALID_VALUE' },
    }),
});

// Reasons of a report, same values as the report_reason enum of the database
export const REPORT_REASONS = ['abus', 'inapproprie', 'erronee', 'autre'];

export const reportSchema = z.object({
  postId: z.string(required('La publication')).uuid('La publication est invalide.'),
  reason: z.enum(REPORT_REASONS, {
    errorMap: () => ({ message: 'Choisissez un motif de signalement.' }),
  }),
});

export const profileSchema = z.object({
  firstName: name('Le prénom').optional(),
  lastName: name('Le nom').optional(),
  bio: z.string().trim().max(500, 'La bio ne doit pas dépasser 500 caractères.').optional(),
  avatar: z
    .union([z.literal(''), z.string().trim().url("L'avatar doit être une adresse web.").max(500)])
    .optional(),
});
