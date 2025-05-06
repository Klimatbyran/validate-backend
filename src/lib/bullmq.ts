import { JobType, Queue } from "bullmq"
import redis from "../config/redis"

export type STATUS = 'active' | 'waiting' | 'waiting-children' | 'prioritized' | 'completed' | 'failed' | 'delayed' | 'paused';
export const JOB_STATUS = ['active', 'waiting', 'waiting-children', 'prioritized', 'completed', 'failed', 'delayed', 'paused'];

export const QUEUE_NAMES = {
    NLM_PARSE_PDF: 'nlmParsePDF',
    DOCLING_PARSE_PDF: 'doclingParsePDF',
    NLM_EXTRACT_TABLES: 'nlmExtractTables',
    INDEX_MARKDOWN: 'indexMarkdown',
    PRECHECK: 'precheck',
    GUESS_WIKIDATA: 'guessWikidata',
    FOLLOW_UP: 'followUp',
    EXTRACT_EMISSIONS: 'extractEmissions',
    CHECK_DB: 'checkDB',
    DIFF_BASE_YEAR: 'diffBaseYear',
    DIFF_GOALS: 'diffGoals',
    DIFF_INDUSTRY: 'diffIndustry',
    DIFF_INITIATIVES: 'diffInitiatives',
    DIFF_REPORTING_PERIODS: 'diffReportingPeriods',
    DIFF_TAGS: 'diffTags',
    SAVE_TO_API: 'saveToAPI',
    SEND_COMPANY_LINK: 'sendCompanyLink',
    WIKIPEDIA_UPLOAD: 'wikipediaUpload',
}

async function startQueues() {    
    const queues = Object.values(QUEUE_NAMES).map((name) => new Queue(name, { connection: redis }))
    await Promise.all(queues.map((queue) => queue.waitUntilReady()))
    return queues
}

export default startQueues;