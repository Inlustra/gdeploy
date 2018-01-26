import { Task } from './models/task.model'
import { Stream, Writable } from 'stream'
import * as fs from 'fs'
import * as logger from 'winston'
import { timestamper } from './stream-utils/timestamper'
import { TaskHandler } from './task-handler'
import { stringAppender } from './stream-utils/string-appender'
import { EventEmitter } from 'events'

enum TaskRunnerEvents {
  REGISTER_TASK = 'register_task',
  REMOVE_TASK = 'remove_task',
  START_TASK = 'start_task'
}

export class TaskRunner extends EventEmitter {
  static readonly Events = TaskRunnerEvents
  tasks: { [key: string]: TaskHandler } = {}
  globalPipes: Set<Writable> = new Set([process.stdout])

  registerTask(task: Task) {
    const taskKey = task.name + '-' + Math.floor(Math.random() * Date.now())
    const handler = new TaskHandler(task)
    this.tasks[taskKey] = handler
    this.globalPipes.forEach(pipe => this.addTaskPipe(taskKey, pipe))
    handler.on('close', () => this.removeTask(taskKey))
    this.emit(TaskRunner.Events.REGISTER_TASK, taskKey)
    return taskKey
  }

  removeTask(taskKey: string) {
    const task = this.tasks[taskKey].task
    delete this.tasks[taskKey]
    this.emit(TaskRunner.Events.REMOVE_TASK, taskKey)
  }

  startTask(...taskKeys: string[]) {
    taskKeys.forEach(taskKey => {
      const task = this.tasks[taskKey]
      if (!task) {
        throw new Error(
          `Task ${taskKey} not found, ensure it was registered before starting it`
        )
      }
      this.emit(TaskRunner.Events.START_TASK, taskKey)
      task.stepTask()
    })
  }

  addGlobalPipe(writable: Writable) {
    Object.keys(this.tasks).forEach(key => this.addTaskPipe(key, writable))
    this.globalPipes.add(writable)
  }

  removeGlobalPipe(writable: Writable) {
    Object.keys(this.tasks).forEach(key => this.removeTaskPipe(key, writable))
    this.globalPipes.delete(writable)
  }

  addTaskPipe(taskKey: string, writable: Writable) {
    this.tasks[taskKey].pipe(writable)
    writable.on('close', () => this.removeTaskPipe(taskKey, writable))
  }

  removeTaskPipe(taskKey: string, writable: Writable) {
    this.tasks[taskKey].unpipe(writable)
  }
}
