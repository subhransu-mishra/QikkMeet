/**
 * Simple in-memory queue (no Redis required)
 * For development only - use Bull + Redis in production
 */
class InMemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.processors = [];
    this.isProcessing = false;
  }

  async add(jobName, data) {
    const job = {
      id: Date.now() + Math.random(),
      name: jobName,
      data,
      timestamp: new Date(),
    };

    this.jobs.push(job);
    console.log(`📨 Job ${job.id} added to ${this.name} queue`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processJobs();
    }

    return job;
  }

  process(jobName, handler) {
    this.processors.push({ jobName, handler });
  }

  async processJobs() {
    if (this.jobs.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const job = this.jobs.shift();

    try {
      const processor = this.processors.find((p) => p.jobName === job.name);

      if (processor) {
        console.log(`⚙️ Processing job ${job.id}...`);
        await processor.handler(job);
        console.log(`✅ Job ${job.id} completed`);
      }
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error.message);
    }

    // Process next job
    setTimeout(() => this.processJobs(), 100);
  }

  on(event, handler) {
    // Stub for compatibility
    console.log(`Event listener registered: ${event}`);
  }
}

export const moderationQueue = new InMemoryQueue("message-moderation");

export default moderationQueue;
