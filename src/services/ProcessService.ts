import { QUEUE_NAMES } from "../lib/bullmq";
import { CompanyProcess, DataJob, Process, ProcessStatus } from "../schemas/types";
import { QueueService } from "./QueueService";

export class ProcessService {
    private static processService: ProcessService
    private queueService: QueueService;
    private constructor(queueService: QueueService) {
        this.queueService = queueService;
    }

    public static async getProcessService(): Promise<ProcessService> {
        if(!ProcessService.processService) {
            const queueService = await QueueService.getQueueService();
            ProcessService.processService = new ProcessService(queueService);
        }
        return ProcessService.processService;
    }

    public async getProcess(id: string): Promise<Process> {
        const jobs = await this.queueService.getDataJobs(undefined, undefined, id);
        return this.createProcess(jobs);
    }

    public async getProcesses(): Promise<Process[]> {
        const jobs = await this.queueService.getDataJobs(undefined, undefined);
        const jobProcesses: Record<string, DataJob[]> = {};
        for(const job of jobs) {
            if(!jobProcesses[job.data.id ?? job.data.threadId ?? "unknown"]) {
                jobProcesses[job.data.id ?? job.data.threadId ?? "unknown"] = [];
            }
            jobProcesses[job.data.id ?? job.data.threadId ?? "unknown"].push(job);
        }
        const processes: Process[] = [];
        for(const jobProcess of Object.values(jobProcesses)) {
            processes.push(this.createProcess(jobProcess));
        }
        return processes;
    }

    public async getProcessesGroupedByCompany(): Promise<CompanyProcess[]> {
            const processes = await this.getProcesses();
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

    private createProcess(jobs: DataJob[]): Process {
        let id: string | undefined;
        let wikidataId: string | undefined;	
        let company: string | undefined;
        let year: number | undefined;

        for(const job of jobs) {
            if(job.data.id || job.data.threadId) {
                id = job.data.id || job.data.threadId;
            }
            if(job.data.wikidata) {
                wikidataId = job.data.wikidata.node;
            }
            if(job.data.companyName) {
                company = job.data.companyName;
            }
            if(job.data.year) {
                year = job.data.reportYear;
            }
        }

        const process: Process = {
            id: id ?? "unknown",
            jobs,
            wikidataId,
            company,
            year,
            status: this.getProcessStatus(jobs),
        }
        return process;
    }

    private getProcessStatus(jobs: DataJob[]): ProcessStatus {
        if(jobs.find(job => job.status === 'failed')) {
            return 'failed';
        }
        if(jobs.find(job => ['waiting', 'delayed', 'paused'].includes(job.status ?? ''))) {
            return 'waiting';
        }
        if(jobs.find(job => job.queue === QUEUE_NAMES.SEND_COMPANY_LINK && job.status === 'completed')) {
            return 'completed';
        }
        return 'active';
    }
}