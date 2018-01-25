import { Task } from './models/task.model'
import { Job } from './models/job.model'
import { Readable, Writable, Transform } from 'stream'
import * as logger from 'winston'
import { timestamper } from './stream-utils/timestamper'
import * as split2 from 'split2'
import { red } from './stream-utils/colorizer'
class TaskContext extends Transform {
  readonly startTimeMillis = Date.now()

  step: number = -1

  constructor(public task: Task) {
    super()
  }

  get currentJob() {
    return this.task.jobs[this.step]
  }

  stepTask() {
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
    child.stdout.pipe(split2(), { end: false }).pipe(this)
    child.stderr
      .pipe(split2(), { end: false })
      .pipe(red())
      .pipe(this)
    child.on('close', code => this.onChildClose(code))
  }

  private onChildClose(code: number) {
    if (code === 0) {
      this.stepTask()
    } else {
      this.end(`Error ${code} from job: ${this.currentJob.name}`)
      this.destroy()
    }
  }

  _transform(line, encoding, cb) {
    this.push(`[${this.currentJob.name}] ${line} \n`)
    cb()
  }
}

export { TaskContext }
