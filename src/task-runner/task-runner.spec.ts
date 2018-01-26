import { Test } from '@nestjs/testing'
import { TaskRunner } from './task-runner'
import * as tasks from './test-utils/tasks/test.task'
import * as logger from 'winston'
import { PassThrough, Writable } from 'stream'
import chalk from 'chalk'

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

  it('successfully run all tasks', cb => {
    taskRunner.startTask(taskRunner.registerTask(tasks.successfulTask('./')))
    taskRunner.on(TaskRunner.Events.REMOVE_TASK, cb)
  })

  it('Not error if the write stream closes early', cb => {
    const bufferPipe = new Writable({
      write: (d, enc, cb) => {
        process.stdout.write(chalk.bgBlue(d.toString()))
        cb(null, d)
      }
    })
    const buffer2Pipe = new Writable({
      write: (d, enc, cb) => {
        process.stdout.write(chalk.bgCyan(d.toString()))
        cb(null, d)
      }
    })
    const task = taskRunner.registerTask(
      tasks.sleepEchoTask('Hi', '2', "I shouldn't be appearing!")
    )
    //taskRunner.on(TaskRunner.Events.TASK_STAGE_UPDATE, console.log)
    setTimeout(() => bufferPipe.destroy(), 1000)
    setTimeout(() => taskRunner.addTaskPipe(task, buffer2Pipe), 1200)
    taskRunner.addTaskPipe(task, bufferPipe)
    taskRunner.startTask(task)
    taskRunner.on(TaskRunner.Events.REMOVE_TASK, cb)
  })

  it('successfully cancel the task before execution', cb => {
    const task = taskRunner.registerTask(
      tasks.sleepEchoTask('Hi', '2', "I shouldn't be appearing!")
    )
    setTimeout(() => taskRunner.cancelTask(task), 1000)
    taskRunner.on(TaskRunner.Events.TASK_STAGE_UPDATE, console.log)
    taskRunner.on(TaskRunner.Events.REMOVE_TASK, cb)
    taskRunner.startTask(task)
  })

  it('should skip the next task if the previous task has an incorrect previousCondition', cb => {
    taskRunner.startTask(taskRunner.registerTask(tasks.errorTask('./', 10)))
    taskRunner.on(TaskRunner.Events.REMOVE_TASK, cb)
  })

  xit('should correctly launch a simple task', cb => {
    taskRunner.startTask(
      taskRunner.registerTask(
        tasks.cloneAndRun('git@github.com:Inlustra/env-args.git', 'echo "OUT!"')
      )
    )
    taskRunner.on(TaskRunner.Events.REMOVE_TASK, cb)
  })
})
