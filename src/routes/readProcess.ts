import { FastifyInstance, FastifyRequest } from "fastify";
import { QueueService } from "../services/QueueService";
import { processesGroupedByCompanyResponseSchema, processesResponseSchema, processResponseSchema } from "../schemas/response";
import { readProcessPathParamsSchema } from "../schemas/request";

export async function readProcessRoute(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        summary: 'Get processes',
        description: '',
        tags: ['Process'],
        response: {
          200: processesResponseSchema
        },
      },
    },
    async (
      _request,
      reply
    ) => {
      const queueService = await QueueService.getQueueService();
      const processes = await queueService.getJobProcesses();      
      return reply.send(processes)
    }
  ); 
  
  app.get(
    '/companies',
    {
      schema: {
        summary: 'Get processes by companies',
        description: '',
        tags: ['Process'],
        response: {
          200: processesGroupedByCompanyResponseSchema
        },
      },
    },
    async (
      _request,
      reply
    ) => {
      const queueService = await QueueService.getQueueService();
      const companyProcesses = await queueService.getJobProcessesGroupedByCompany();      
      return reply.send(companyProcesses)
    }
  ); 

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
      const jobs = await queueService.getJobProcess(id);      
      return reply.send(jobs)
    }
  );
}