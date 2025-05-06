import { Queue } from "bullmq";
import startQueues from "../lib/bullmq";

export class QueueService {
    private static queueService: QueueService | undefined;
    private queues: Record<string, Queue> | undefined;

    private constructor() {}

    public async getQueues() {
        if (!this.queues) {
            const queues = await startQueues();
            this.queues = queues.reduce((acc, queue) => {
                acc[queue.name] = queue;
                return acc;
            }, {} as Record<string, Queue>);
        }
        return this.queues;
    }

    public static async getQueueService() {
        if (!QueueService.queueService) {
            QueueService.queueService = new QueueService();
        }
        return QueueService.queueService;
    }

    public async getQueue(name: string) {
        if(this.queues === undefined)
            this.queues = await this.getQueues();

        return this.queues[name];
    }
}