import { Task } from '../models/task.model'
import { Job } from '../models/job.model'
import { LsJob } from '../../jobs/ls.job'
import { EchoJob } from '../../jobs/echo.job';

class TestTask implements Task {
  name: string
  description: string
  jobs: Job[]

  constructor(directory: string) {
    this.name = 'Test Task'
    this.description = 'A task to list a directory'
    this.jobs = [new EchoJob('Wooooooop!'), new LsJob(directory)]
  }
}

export { TestTask }
