import { z } from "zod";
import { baseJobSchema, dataJobSchema, queueStatusSchema } from "./response";
import { addQueueJobBodySchema } from "./request";

export type BaseJob = z.infer<typeof baseJobSchema>

export type DataJob = z.infer<typeof dataJobSchema>;

export type QueueStatus = z.infer<typeof queueStatusSchema>;

export type AddJobBody = z.infer<typeof addQueueJobBodySchema>;