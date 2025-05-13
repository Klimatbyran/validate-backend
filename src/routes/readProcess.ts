import { FastifyInstance, FastifyRequest } from "fastify";
import { QueueService } from "../services/QueueService";
import { processResponseSchema } from "../schemas/response";
import { readProcessPathParamsSchema } from "../schemas/request";

export async function readProcessRoute(app: FastifyInstance) {
  app.get(
    '/:id',
    {
      schema: {
        summary: 'Get jobs in requested process',
        description: '',
        tags: ['Process'],
        params: readProcessPathParamsSchema,
        response: {
          200: processResponseSchema
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: {id: string},
      }>,
      reply
    ) => {
      const { id } = request.params;
      const queueService = await QueueService.getQueueService();
      const jobs = await queueService.getJobGroups(id);      
      return reply.send(jobs)
    }
  );
}