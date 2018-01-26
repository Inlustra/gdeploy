import { Job } from '../task-runner/models/job.model'
import { spawn, SpawnOptions } from 'child_process'

function shJob(
  command: string,
  spawnOptions: SpawnOptions = {}
): Job {
  return {
    name: `Run ${command}`,
    description: `Run the following command: ${command}`,
    start: () =>
      spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true,
        ...spawnOptions
      })
  }
}

export { shJob }
