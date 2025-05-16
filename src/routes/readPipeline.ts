import { FastifyInstance } from "fastify";
import { pipelineSchema } from "../schemas/common";
import { PipelineService } from "../services/PipelineService";

export async function readPipelineRoute(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        summary: 'Get pipeline description',
        description: '',
        tags: ['Pipeline'],
        response: {
          200: pipelineSchema
        },
      },
    },
    async (
      _request,
      reply
    ) => {
      const pipelineService = PipelineService.getPipelineService();
      const pipeline = pipelineService.getPipelineDescription();  
      return reply.send(pipeline);
    }
  ); 
}