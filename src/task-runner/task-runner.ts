import { Task } from './models/task.model'
import { Stream } from 'stream'
import * as fs from 'fs'
import * as logger from 'winston'
import { timestamper } from './stream-utils/timestamper'
import { TaskHandler } from './task-handler'
import { Component } from '@nestjs/common'
import { stringAppender } from './stream-utils/string-appender'

@Component()
export class TaskRunner {
  tasks: { [key: string]: TaskHandler } = {}

  private createFileOutput(file: string) {
    logger.silly(`Creating log file stream ${file}`)
    return fs.createWriteStream(file)
  }

  registerTask(task: Task) {
    const taskKey = task.name + '-' + Math.floor(Math.random() * Date.now())
    const context = new TaskHandler(task)
    context.pipe(stringAppender(`[${taskKey}] `)).pipe(process.stdout)
    this.tasks[taskKey] = context
    context.on('close', () => this.removeTask(taskKey))
    context.on(TaskHandler.STAGE_UPDATE_EVENT, console.log)
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
