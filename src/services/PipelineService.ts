import { pipeline } from "../config/pipeline";
import { Pipeline } from "../schemas/types"

export class PipelineService {
    private static pipelineService: PipelineService | undefined;

    private constructor() {}

    public static getPipelineService() {
        if (!PipelineService.pipelineService) {
            PipelineService.pipelineService = new PipelineService();
        }
        return PipelineService.pipelineService;
    }

    public getPipelineDescription(): Pipeline {
        return pipeline
    }

}