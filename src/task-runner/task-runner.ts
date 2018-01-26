import { Task } from './models/task.model'
import { Stream, Writable } from 'stream'
import * as fs from 'fs'
import * as logger from 'winston'
import { timestamper } from './stream-utils/timestamper'
import { TaskHandler } from './task-handler'
import { Component } from '@nestjs/common'
import { stringAppender } from './stream-utils/string-appender'

@Component()
export class TaskRunner {
  tasks: { [key: string]: TaskHandler } = {}

  registerTask(task: Task) {
    const taskKey = task.name + '-' + Math.floor(Math.random() * Date.now())
    const handler = new TaskHandler(task)
    handler.pipe(stringAppender(`[${taskKey}] `)).pipe(process.stdout)
    this.tasks[taskKey] = handler
    handler.on('close', () => this.removeTask(taskKey))
    //handler.on(TaskHandler.STAGE_UPDATE_EVENT, x => console.log(JSON.stringify(x, null, 4)))
    logger.silly(`Registered new task: ${task.name} [${taskKey}]`)
    return taskKey
  }

  removeTask(taskKey: string) {
    const task = this.tasks[taskKey].task
    delete this.tasks[taskKey]
    logger.silly(`Removed task: ${task.name}`)
  }

  startTask(...taskKeys: string[]) {
    taskKeys.forEach(key => {
      const task = this.tasks[key]
      if (!task) {
        logger.error(
          `Task ${key} not found, ensure it was registered before starting it`
        )
        return
      }
      task.stepTask()
    })
  }

}
