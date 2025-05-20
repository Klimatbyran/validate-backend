import { z } from "zod";
import { baseJobSchema, companyProcessSchema, dataJobSchema, processSchema, queueStatusSchema } from "./response";
import { addQueueJobBodySchema } from "./request";
import { pipelineSchema, processStatusSchema } from "./common";

export type BaseJob = z.infer<typeof baseJobSchema>

export type DataJob = z.infer<typeof dataJobSchema>;

export type QueueStatus = z.infer<typeof queueStatusSchema>;

export type AddJobBody = z.infer<typeof addQueueJobBodySchema>;

export type Process = z.infer<typeof processSchema>;

export type CompanyProcess = z.infer<typeof companyProcessSchema>;

export type Pipeline = z.infer<typeof pipelineSchema>;

export type ProcessStatus = z.infer<typeof processStatusSchema>;