import { Task } from './models/task.model'
import { Stream } from 'stream'
import * as fs from 'fs'
import * as logger from 'winston'
import { timestamper } from './stream-utils/timestamper'
import { TaskContext } from './task-context'
import { Component } from '@nestjs/common'
import { stringAppender } from './stream-utils/string-appender'

@Component()
export class TaskRunner {
  runningTasks: { [key: string]: TaskContext } = {}

  private createFileOutput(file: string) {
    logger.silly(`Creating log file stream ${file}`)
    return fs.createWriteStream(file)
  }

  registerTask(task: Task) {
    const taskKey = task.name + '-' + Math.floor(Math.random() * Date.now())
    const context = new TaskContext(task)
    context.pipe(stringAppender(`[${taskKey}] `)).pipe(process.stdout)
    this.runningTasks[taskKey] = context
    context.on('close', () => this.removeTask(taskKey))
    logger.silly(`Registered new task: ${task.name} [${taskKey}]`)
    return taskKey
  }

  removeTask(taskKey: string) {
    const task = this.runningTasks[taskKey].task
    delete this.runningTasks[taskKey]
    logger.silly(`Removed task: ${task.name}`)
  }

  startTask(...taskKeys: string[]) {
    taskKeys.forEach(key => {
      const task = this.runningTasks[key]
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
