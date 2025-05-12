import { z } from 'zod';
import { jobStatusSchema } from './common';

export const baseJobSchema = z.object({
    name: z.string(),
    id: z.string(),
    timestamp: z.number(),
    processedBy: z.number().optional(),
    finishedOn: z.number().optional(),
    attemptsMade: z.number(),
    failedReason: z.string().optional(),
    stacktrace: z.array(z.string()).optional(),
    progress: z.number(),
    returnvalue: z.any().optional(),
    opts: z.object({}).optional(),
    delay: z.number().optional(),
    type: jobStatusSchema.optional(),
});

export const dataJobSchema = baseJobSchema.extend({
    data: z.any().optional(),
});

export const queueStatusSchema = z.object({
  name: z.string(),
  status: z.record(jobStatusSchema, z.number().optional())
})

export const queueStatsResponseSchema = z.array(queueStatusSchema);

export const queueResponseSchema = z.array(baseJobSchema);

export const queueJobResponseSchema = dataJobSchema;

export const error404ResponseSchema = z.object({
  error: z.string(),
});