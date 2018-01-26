import { Test } from '@nestjs/testing'
import { TaskRunner } from './task-runner'
import * as tasks from './test-utils/tasks/test.task'
import * as logger from 'winston'

logger.configure({
  transports: [new logger.transports.Console({ level: 'silly' })]
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
    //const key1 = taskRunner.registerTask(tasks.successfulTask('./'))
    const key2 = taskRunner.registerTask(
      tasks.cloneAndRun('git@github.com:Inlustra/env-args.git', 'echo "OUT!"')
    )
    taskRunner.startTask(key2)
  })
})
