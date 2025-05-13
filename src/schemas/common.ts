import { z } from "zod";

export const jobStatusSchema = z.enum(['active', 'waiting', 'waiting-children', 'prioritized', 'completed', 'failed', 'delayed', 'paused', 'repeat', 'wait']);