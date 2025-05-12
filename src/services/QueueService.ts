import { JobType, Queue } from "bullmq";
import startQueues, { JOB_STATUS, STATUS } from "../lib/bullmq";
import { BaseJob, DataJob, QueueStatus } from "../schemas/types";

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

    public async getJobs(queueName: string, status?: string): Promise<BaseJob[]> {
        const queue = await this.getQueue(queueName);
        const jobs: BaseJob[] = []
        const queryStatus = status ? [status] : JOB_STATUS;
        for(const status of queryStatus) {
            const rawJobs = await queue.getJobs([status as JobType]);
            jobs.push(...rawJobs.map(job => {
                const baseJob: BaseJob = {
                name: job.name,
                id: job.id,
                timestamp: job.timestamp,
                processedBy: job.processedBy,
                finishedOn: job.finishedOn,
                attemptsMade: job.attemptsMade,
                failedReason: job.failedReason,
                stacktrace: job.stacktrace,
                progress: job.progress,
                returnvalue: job.returnvalue,
                opts: job.opts,
                delay: job.delay,
                type: status as STATUS
                };
                return baseJob;
            }));
        }
        return jobs;
    }

    public async getJobData(queueName: string, jobId: string): Promise<any> {
        const queue = await this.getQueue(queueName);
        const job = await queue.getJob(jobId);
        if(!job) throw new Error(`Job ${jobId} not found`);
        return {
            name: job.name,
            id: job.id,
            timestamp: job.timestamp,
            processedBy: job.processedBy,
            finishedOn: job.finishedOn,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace,
            progress: job.progress,
            returnvalue: job.returnvalue,
            opts: job.opts,
            delay: job.delay,
            data: job.data,
        };
    }

    public async getQueueStats(queueName?: string): Promise<QueueStatus[]> {
        const queues = queueName ? [await this.getQueue(queueName)] : Object.values(await this.getQueues());
        const stats: QueueStatus[] = [];
        for(const queue of queues) {
            const queueStats: Record<string, number> = {};
            const rawStats = await queue.getJobCounts(...(JOB_STATUS as JobType[]));
            for(const [key, value] of Object.entries(rawStats)) {
                queueStats[key] = value;
            }
            stats.push({
                name: queue.name,
                status: queueStats
            })
        }
        return stats;
    }
}