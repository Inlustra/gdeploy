import { Test } from '@nestjs/testing'
import { TaskRunner } from './task-runner'
import { TestTask } from './tasks/test.task'
import { LsJob } from '../jobs/ls.job'
import * as logger from 'winston'

logger.configure({
  transports: [new logger.transports.Console({level: 'silly'})]
})

describe('TaskRunner', () => {
  let taskRunner: TaskRunner

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [],
      components: [TaskRunner]
    }).compile()

    taskRunner = module.get<TaskRunner>(TaskRunner)
  })

  it('should correctly launch a simple task', cb => {
    const key = taskRunner.registerTask(new TestTask('./'))
    taskRunner.startTask(key)
  })
})
