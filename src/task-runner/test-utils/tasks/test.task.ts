import { Task } from '../../models/task.model'
import { Job } from '../../models/job.model'
import { LsJob } from '../../../jobs/ls.job'
import { EchoJob } from '../../../jobs/echo.job'
import { ExitJob } from '../jobs/exit.job'

function successfulTask(directory: string, code: number): Task {
  return {
    name: 'Successful Test Task',
    description: 'A task to list a directory',
    jobs: [new EchoJob('Wooooooop!'), new LsJob(directory)]
  }
}

function errorTask(directory: string, code: number): Task {
  return {
    name: 'Error Test Task',
    description: 'A task to list a directory',
    jobs: [new EchoJob('Wooooooop!'), new ExitJob(code), new LsJob(directory)]
  }
}

export { successfulTask, errorTask }
