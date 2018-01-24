import { Job } from '../task-runner/models/job.model'
import { spawn } from 'child_process'
import * as through2 from 'through2'
class LsJob implements Job {
  constructor(private directory: string) {}

  name = 'List Directory'
  description = `List the directory at ${this.directory}`

  start() {
    const child = spawn('ls', [this.directory], {stdio: ['pipe', 'pipe', 'pipe'], detached: true})
    return child
  }
}

export { LsJob }
