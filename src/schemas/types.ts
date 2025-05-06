import { z } from "zod";
import { baseJobSchema } from "./response";

export type BaseJob = z.infer<typeof baseJobSchema>