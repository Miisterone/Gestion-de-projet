import { z } from 'zod';
import { name, zoneId } from './fields';

export const profileSchema = z.object({
  firstName: name('Le prénom').optional(),
  lastName: name('Le nom').optional(),
  bio: z.string().trim().max(500, 'La bio ne doit pas dépasser 500 caractères.').optional(),
  avatar: z
    .union([z.literal(''), z.string().trim().url("L'avatar doit être une adresse web.").max(500)])
    .optional(),
  // Lets the accounts created before the zones choose one (LL_PROFILE_ZONE_409)
  zoneId: zoneId.optional(),
});
