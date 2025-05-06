import { z } from 'zod';

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
    type: z.enum(['active', 'waiting', 'waiting-children', 'prioritized', 'completed', 'failed', 'delayed', 'paused']),
  });

export const queueResponseSchema = z.array(baseJobSchema);
