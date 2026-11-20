import { reportSchema } from '../schemas';
import { body, date, id, ok, registry, route, z } from './registry';

const Report = registry.register(
  'Report',
  z.object({
    id,
    postId: id,
    reason: reportSchema.shape.reason,
    createdAt: date,
  })
);

registry.register('ReportBody', reportSchema);

route({
  method: 'post',
  path: '/api/reports',
  tags: ['Signalements'],
  summary: "Signaler la publication d'un voisin",
  request: body(reportSchema),
  responses: { 201: ok(z.object({ report: Report }), 'Signalement enregistré') },
  codes: ['LL_VALIDATION_422', 'LL_REPORT_403', 'LL_POST_404', 'LL_REPORT_409'],
});
