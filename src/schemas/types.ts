import { z } from "zod";
import { baseJobSchema, dataJobSchema, queueStatusSchema } from "./response";

export type BaseJob = z.infer<typeof baseJobSchema>

export type DataJob = z.infer<typeof dataJobSchema>;

export type QueueStatus = z.infer<typeof queueStatusSchema>;