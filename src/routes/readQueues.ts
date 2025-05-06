import { FastifyInstance, FastifyRequest } from "fastify";
import { QueueService } from "../services/QueueService";
import { BaseJob } from "../schemas/types";
import { queueResponseSchema } from "../schemas/response";
import { JOB_STATUS, STATUS } from "../lib/bullmq";
import { JobType } from "bullmq";

export async function readQueuesRoute(app: FastifyInstance) {
    app.get(
      '/:name',
      {
        schema: {
          summary: 'Get jobs in requested route',
          description: '',
          tags: ['Queues'],
          response: {
            200: queueResponseSchema
          },
        },
      },
      async (
        request: FastifyRequest<{
          Params: {name: string}
        }>,
        reply
      ) => {
        const { name } = request.params;
        const queueService = await QueueService.getQueueService();
        const queue = await queueService.getQueue(name);
        const jobs: BaseJob[] = []
        for(const status of JOB_STATUS) {
          const rawJobs = await queue.getJobs([status as JobType]);
          jobs.push(...rawJobs.map(job => {
            const baseJob: BaseJob = {
              name: job.name,
              id: job.id,
              timestamp: job.timestamp,
              processedBy: job.processedBy,
              finishedOn: job.finishedOn,
              attemptsMade: job.attemptsMade,
              failedReason: job.failedReason,
              stacktrace: job.stacktrace,
              progress: job.progress,
              returnvalue: job.returnvalue,
              opts: job.opts,
              delay: job.delay,
              type: status as STATUS
            };
            return baseJob;
          }));
        }
        return reply.send(jobs)
      }
    )
  }