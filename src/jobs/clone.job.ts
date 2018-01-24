import { Job } from '../task-runner/models/job.model'
import { spawn } from 'child_process'
import * as through2 from 'through2'
class CloneJob implements Job {
  constructor(
    private gitUrl: string,
    private toDir: string,
    private options?: any
  ) {}

  name = 'Git Clone'
  description = `Clone the git repository from ${this.gitUrl} to ${this.toDir}`

  start() {
    const child = spawn(`git clone ${this.gitUrl} ${this.toDir}`)
    return child
  }
}

export { CloneJob }
