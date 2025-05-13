import { Job, JobType, Queue } from "bullmq";
import startQueues, { JOB_STATUS, STATUS } from "../lib/bullmq";
import { BaseJob, CompanyProcess, DataJob, Process, QueueStatus } from "../schemas/types";

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
            const transformedJobs = await Promise.all(
                rawJobs.map(job => this.transformJobtoBaseJob(job, status))
            );
            jobs.push(...transformedJobs);
        }
        return jobs;
    }

    public async addJob(queueName: string, url: string, autoApprove: boolean = false): Promise<BaseJob> {
        const queue = await this.getQueue(queueName);
        const id = crypto.randomUUID();
        const job = await queue.add('download ' + url.slice(-20), { url: url.trim(), autoApprove, id });
        return this.transformJobtoBaseJob(job);
    }

    public async getJobData(queueName: string, jobId: string): Promise<DataJob> {
        const queue = await this.getQueue(queueName);
        const job = await queue.getJob(jobId);
        if(!job) throw new Error(`Job ${jobId} not found`);
        const baseJob: DataJob = await this.transformJobtoBaseJob(job);
        baseJob.data = job.data;        
        baseJob.returnvalue = job.returnvalue;
        return baseJob;
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

    public async getJobProcess(id: string): Promise<BaseJob[]> {
        const queues = await this.getQueues();
        const jobs: BaseJob[] = [];
        for(const queue of Object.values(queues)) {
            const queueJobs = await queue.getJobs();
            const filteredJobs = queueJobs
                .filter(job => (job.data.id === id || job.data.threadId === id))
                .map(job => this.transformJobtoBaseJob(job));

            jobs.push(...await Promise.all(filteredJobs));
        }
        return jobs;
    }

    public async getJobProcesses(): Promise<Process[]> {
        const queues = await this.getQueues();
        const processes: Record<string, Process> = {};
        for(const queue of Object.values(queues)) {
            const jobs = await queue.getJobs();
            for(const job of jobs) {
                const id = job.data.id ?? job.data.threadId;
                const { wikidata, companyName } = job.data;
                if(processes[id]) {
                    processes[id].jobs.push(await this.transformJobtoBaseJob(job));
                } else {
                    processes[id] = {
                        id: job.data.id ?? job.data.threadId,
                        jobs: [await this.transformJobtoBaseJob(job)]
                    }
                }
                if(companyName) {
                    processes[id].company = companyName;
                }                    

                if(wikidata) {
                    processes[id].wikidataId = wikidata.node;    
                }
                                
            }
        }
        return Object.values(processes);
    }

    public async getJobProcessesGroupedByCompany(): Promise<CompanyProcess[]> {
        const processes = await this.getJobProcesses();
        const companyProcesses: Record<string, CompanyProcess> = {};
        for(const process of processes) {
            const company = process.company ?? "unknown";
            if(companyProcesses[company]) {
                companyProcesses[company].processes.push(process);
            } else {
                companyProcesses[company] = {
                    company: process.company,
                    processes: [process]
                }
            }
            if(process.wikidataId && company !== "unknown") {
                companyProcesses[company].wikidataId = process.wikidataId;    
            }
        }
        return Object.values(companyProcesses);
    }

    private async transformJobtoBaseJob(job: Job, status?: string): Promise<BaseJob> {
        return {
            name: job.name,
            queue: job.queueName,
            id: job.id,
            processId: job.data.id ?? job.data.threadId ?? undefined,
            timestamp: job.timestamp,
            processedBy: job.processedBy,
            finishedOn: job.finishedOn,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace ?? [],
            progress: typeof job.progress === 'number' ? job.progress : undefined,
            opts: job.opts,
            delay: job.delay,
            state: (await job.getState()) as JobType
        };
    }
}