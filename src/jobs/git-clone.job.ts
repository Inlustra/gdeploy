import { Job } from '../task-runner/models/job.model'
import { spawn, SpawnOptions } from 'child_process'
import * as through2 from 'through2'

function gitCloneJob(url: string, directory: string, spawnOptions: SpawnOptions = {}): Job {
  return {
    name: 'Git Clone',
    description: `Clone the repo at: ${url}`,
    start: () =>
      spawn('git', ['clone', url, directory], {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...spawnOptions
      })
  }
}

export { gitCloneJob }
