import { z } from 'zod';
import { required, text } from './fields';

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
