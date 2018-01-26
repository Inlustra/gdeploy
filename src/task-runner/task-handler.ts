import { Task } from './models/task.model'
import { Job } from './models/job.model'
import { Transform } from 'stream'
import * as split2 from 'split2'
import { red } from './stream-utils/colorizer'
import { TaskContext } from './models/task-context.model'
import { ChildProcess } from 'child_process'
import { JobStatus } from './models/job-status.model'
import { JobStage } from './models/job-stage.model'
import { TaskAlreadyFinishedError } from './errors'

enum TaskHandlerEvents {
  STAGE_UPDATE = 'stage_update'
}

class TaskHandler extends Transform {
  static readonly Events = TaskHandlerEvents

  private stepIndex: number = -1
  private stages: JobStage[]
  private child: ChildProcess

  get context(): TaskContext {
    return {
      step: this.stepIndex,
      stages: this.stages
    }
  }

  get currentJob(): Job {
    return this.task.jobs[this.stepIndex]
  }

  get currentStage(): JobStage {
    return this.stages[this.stepIndex]
  }

  constructor(public task: Task) {
    super()
    this.stages = this.task.jobs.map(job => ({
      job,
      status: JobStatus.PENDING
    }))
  }

  step() {
    const previousStatus = this.currentStage && this.currentStage.status
    while (++this.stepIndex < this.task.jobs.length) {
      if (this.canRunJob(this.currentJob, previousStatus)) {
        return this.startJob(this.currentJob)
      }
      this.updateJobStatus(JobStatus.SKIPPED)
    }
    this.destroy()
  }

  private canRunJob(
    { previousTaskCondition }: Job,
    previousStatus?: JobStatus
  ) {
    return (
      !previousStatus ||
      (!previousTaskCondition && previousStatus === JobStatus.SUCCESS) ||
      previousTaskCondition === previousStatus
    )
  }

  cancel() {
    if (this.stepIndex >= this.task.jobs.length) {
      throw new TaskAlreadyFinishedError()
    }
    this.child.kill('SIGINT')
  }

  private startJob(job: Job) {
    this.child = this.currentJob.start(this.context)
    this.setupChildProcess(this.child)
    this.updateJobStatus(JobStatus.RUNNING)
  }

  private setupChildProcess(child: ChildProcess) {
    child.stdout.pipe(split2(), { end: false }).pipe(this)
    child.stderr
      .pipe(split2(), { end: false })
      .pipe(red())
      .pipe(this)
    child.on('close', code => this.onChildClose(code))
  }

  private onChildClose(code: number) {
    let status = JobStatus.SUCCESS
    if (code === null) {
      status = JobStatus.CANCELLED
    } else if (code === 0) {
      status = JobStatus.SUCCESS
    }
    this.updateJobStatus(status)
    this.step()
  }

  private updateJobStatus(jobStatus: JobStatus) {
    this.currentStage.status = jobStatus
    this.emit(TaskHandler.Events.STAGE_UPDATE, this.stages)
  }

  _transform(line, encoding, cb) {
    this.push(`[${this.currentJob.name}] ${line} \n`)
    cb()
  }
}

export { TaskHandler }
