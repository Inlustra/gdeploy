import { Job } from '../task-runner/models/job.model'
import { spawn, SpawnOptions } from 'child_process'
import * as through2 from 'through2'

function echoJob(str: string, spawnOptions: SpawnOptions = {}): Job {
  return {
    name: 'Echo',
    description: `Print: ${str}`,
    start: () =>
      spawn('echo', [str], {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...spawnOptions
      })
  }
}

export { echoJob }
