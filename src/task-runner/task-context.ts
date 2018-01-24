import { Task } from './models/task.model'
import { Job } from './models/job.model'
import { Readable, Writable, Transform } from 'stream'
import * as logger from 'winston'
import { timestamper } from './pipes/timestamper'
import * as split2 from 'split2'
class TaskContext extends Transform {
  readonly startTimeMillis = Date.now()
  step = -1

  constructor(public task: Task) {
    super()
  }

  stepTask() {
    const currentJob = this.task.jobs[this.step]
    if (currentJob) {
      logger.info(`Finished ${currentJob.name}`)
    }
    const nextJob = this.task.jobs[++this.step]
    if (nextJob) {
      this.startJob(nextJob)
    } else {
      this.end()
      logger.info(`Finished.`)
    }
  }

  private startJob(job: Job) {
    logger.info(`Starting ${job.name}`)
    const child = job.start()
    child.stdout.pipe(split2()).pipe(this, { end: false })
    child.stderr.pipe(split2()).pipe(this, { end: false })
    child.on('close', code => {
      if (code === 0) {
        this.stepTask()
      } else {
        logger.error(`Error ${code} from ${job.name}`)
        this.end()
      }
    })
  }

  _transform(line, encoding, processed) {
    this.push(`[${this.task.jobs[this.step].name}] ${line} \n`)
    processed()
  }
}

export { TaskContext }
