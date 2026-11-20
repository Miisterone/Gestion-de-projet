import { z } from 'zod';
import { required } from './fields';

// Reasons of a report, same values as the report_reason enum of the database
export const REPORT_REASONS = ['abus', 'inapproprie', 'erronee', 'autre'];

export const reportSchema = z.object({
  postId: z.string(required('La publication')).uuid('La publication est invalide.'),
  reason: z.enum(REPORT_REASONS, { error: 'Choisissez un motif de signalement.' }),
});
