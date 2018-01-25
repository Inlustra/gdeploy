import { Task } from '../../models/task.model'
import { Job } from '../../models/job.model'
import { echoJob } from '../../../jobs/echo.job';
import { lsJob } from '../../../jobs/ls.job';
import { exitJob } from '../jobs/exit.job';

function successfulTask(directory: string): Task {
  return {
    name: 'Successful Test Task',
    description: 'A task to list a directory',
    jobs: [echoJob('Wooooooop!'), lsJob(directory)]
  }
}

function errorTask(directory: string, code: number): Task {
  return {
    name: 'Error Test Task',
    description: 'A task to list a directory',
    jobs: [echoJob('Wooooooop!'), exitJob(code), lsJob(directory)]
  }
}

export { successfulTask, errorTask }
