import { Job } from '../task-runner/models/job.model'
import { spawn } from 'child_process'
import * as through2 from 'through2'
class EchoJob implements Job {
  constructor(private str: string) {}

  name = 'Echo'
  description = `Print: ${this.str}`

  start() {
    const child = spawn('echo', [this.str], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true
    })
    return child
  }
}

export { EchoJob }
