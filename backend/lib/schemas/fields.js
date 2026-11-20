// Fields shared by the schemas of several resources
import { z } from 'zod';

export const required = (label) => ({
  required_error: `${label} est obligatoire.`,
  invalid_type_error: `${label} est invalide.`,
});

export const name = (label) =>
  z
    .string(required(label))
    .trim()
    .min(1, `${label} est obligatoire.`)
    .max(50, `${label} ne doit pas dépasser 50 caractères.`);

export const text = (label, max) =>
  z
    .string(required(label))
    .trim()
    .min(1, `${label} est vide.`)
    .max(max, `${label} ne doit pas dépasser ${max} caractères.`);

export const zoneId = z
  .number({ required_error: 'Choisissez votre quartier.', invalid_type_error: 'Choisissez votre quartier.' })
  .int('Choisissez votre quartier.')
  .positive('Choisissez votre quartier.');
