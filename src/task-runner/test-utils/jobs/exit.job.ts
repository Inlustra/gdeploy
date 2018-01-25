import { Job } from '../../models/job.model'
import { spawn } from 'child_process'
import * as through2 from 'through2'
class ExitJob implements Job {
  constructor(private code: number) {}

  name = 'Exit with code'
  description = `Exits with code ${this.code}`

  start() {
    const child = spawn(
      'sh',
      [
        '-c',
        `(>&2 echo "Exiting with code ${this.code}\!") && exit ${this.code}`
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true
      }
    )
    return child
  }
}

export { ExitJob }
