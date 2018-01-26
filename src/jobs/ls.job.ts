import { Job } from '../task-runner/models/job.model'
import { spawn, SpawnOptions } from 'child_process'
import * as through2 from 'through2'

function lsJob(directory: string, spawnOptions: SpawnOptions = {}): Job {
  return {
    name: 'List Directory',
    description: `List directory at: ${directory}`,
    start: () => spawn('ls', [directory], {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...spawnOptions
    })
  }
}
export { lsJob }
