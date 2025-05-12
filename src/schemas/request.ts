import { string, z } from "zod";
import { jobStatusSchema } from "./common";

export const readQueuePathParamsSchema = z.object({
    name: z.string()
});

export const readQueueQueryStringSchema = z.object({
    status: jobStatusSchema.optional()
});

export const readQueueStatsQueryStringSchema = z.object({
    queue: string().optional()
});

export const readQueueJobPathParamsSchema = z.object({
    name: z.string(),
    id: z.string()
});