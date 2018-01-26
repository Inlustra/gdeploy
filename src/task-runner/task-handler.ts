import { Task } from './models/task.model'
import { Job } from './models/job.model'
import { Transform } from 'stream'
import * as split2 from 'split2'
import { red } from './stream-utils/colorizer'
import { TaskContext } from './models/task-context.model'
import { ChildProcess } from 'child_process'
import { JobStatus } from './models/job-status.model'
import { JobStage } from './models/job-stage.model'

class TaskHandler extends Transform {
  public static readonly STAGE_UPDATE_EVENT = 'stage_update'

  private step: number = -1
  private stages: JobStage[]

  get context(): TaskContext {
    return {
      step: this.step,
      stages: this.stages
    }
  }

  get currentJob(): Job {
    return this.task.jobs[this.step]
  }

  get currentStage(): JobStage {
    return this.stages[this.step]
  }

  constructor(public task: Task) {
    super()
    this.stages = this.task.jobs.map(job => ({
      job,
      status: JobStatus.PENDING
    }))
  }

  stepTask() {
    const previousStatus = this.currentStage && this.currentStage.status
    this.step += 1
    if (this.step >= this.task.jobs.length) {
      this.destroy()
      return
    }
    if (this.canRunJob(this.currentJob, previousStatus)) {
      this.startJob(this.currentJob)
    } else {
      this.updateJobStatus(JobStatus.SKIPPED)
    }
  }

  private startJob(job: Job) {
    this.handleChildProcess(this.currentJob.start(this.context))
    this.updateJobStatus(JobStatus.RUNNING)
  }
  private canRunJob(
    { previousTaskCondition }: Job,
    previousStatus?: JobStatus
  ) {
    return (
      !previousStatus ||
      (!previousTaskCondition && previousStatus !== JobStatus.FAILED) ||
      previousTaskCondition === previousStatus
    )
  }

  private handleChildProcess(child: ChildProcess) {
    child.stdout.pipe(split2(), { end: false }).pipe(this)
    child.stderr
      .pipe(split2(), { end: false })
      .pipe(red())
      .pipe(this)
    child.on('close', code => this.onChildClose(code))
  }

  private onChildClose(code: number) {
    this.updateJobStatus(code === 0 ? JobStatus.SUCCESS : JobStatus.FAILED)
    this.stepTask()
  }

  private updateJobStatus(jobStatus: JobStatus) {
    this.currentStage.status = jobStatus
    this.emit(TaskHandler.STAGE_UPDATE_EVENT, this.stages)
  }

  _transform(line, encoding, cb) {
    this.push(`[${this.currentJob.name}] ${line} \n`)
    cb()
  }
}

export { TaskHandler }
