import { Job } from '../../models/job.model'
import { spawn } from 'child_process'
import * as through2 from 'through2'

function exitJob(code: number): Job {
  return {
    name: 'Exit with code',
    description: `Exits with code ${code}`,
    start: () =>
      spawn(
        'sh',
        [
          '-c',
          `(>&2 echo "Exiting with code ${code}\!") && exit ${code}`
        ],
        {
          stdio: ['pipe', 'pipe', 'pipe']
        }
      )
  }
}

export { exitJob }
