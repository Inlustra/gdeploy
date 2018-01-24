import { Task } from './models/task.model'
import { Stream } from 'stream'
import * as fs from 'fs'
import * as logger from 'winston'
import { timestamper } from './pipes/timestamper'
import { TaskContext } from './task-context'
import { Component } from '@nestjs/common'

@Component()
export class TaskRunner {
  taskName: { [key: string]: TaskContext } = {}

  createFileOutput(file: string) {
    logger.silly(`Creating log file stream ${file}`)
    return fs.createWriteStream(file)
  }

  registerTask(task: Task) {
    const taskKey = task.name + '-' + Date.now()
    const context = new TaskContext(task)
    context.pipe(process.stdout)
    this.taskName[taskKey] = context
    context.on('unpipe', () => logger.silly('Unpiped...'))
    context.on('end', () => logger.silly('Ended context'))
    context.on('close', () => this.removeTask(taskKey))
    logger.silly(`Registered new task: ${task.name} [${taskKey}]`)
    return taskKey
  }

  removeTask(taskKey: string) {
    const task = this.taskName[taskKey].task
    delete this.taskName[taskKey]
    logger.silly(`Removed task: ${task.name}`)
  }

  startTask(taskKey: string) {
    const task = this.taskName[taskKey]
    if (!task) {
      logger.error(
        `Task ${taskKey} not found, ensure it was registered before starting it`
      )
      return
    }
    task.stepTask()
  }
}
