// Fields shared by the schemas of several resources
import { z } from 'zod';

const isMissing = (value) => value === undefined || value === null;

// Message of a missing field or of a value of the wrong type
export const required = (label) => ({
  error: (issue) => (isMissing(issue.input) ? `${label} est obligatoire.` : `${label} est invalide.`),
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
  .number({ error: 'Choisissez votre quartier.' })
  .int('Choisissez votre quartier.')
  .positive('Choisissez votre quartier.');
