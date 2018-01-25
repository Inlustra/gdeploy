import { Job } from '../task-runner/models/job.model'
import { spawn, SpawnOptions } from 'child_process'

function spawnJob(
  command: string,
  args: string[],
  opts: SpawnOptions = {}
): Job {
  const commandStr = command + args.join(' ')
  return {
    name: `Run ${command}`,
    description: `Run the following command: ${commandStr}`,
    start: () =>
      spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true,
        ...opts
      })
  }
}

export { spawnJob }
