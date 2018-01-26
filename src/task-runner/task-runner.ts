import { Task } from './models/task.model'
import { Stream, Writable } from 'stream'
import * as fs from 'fs'
import * as logger from 'winston'
import { timestamper } from './stream-utils/timestamper'
import { TaskHandler } from './task-handler'
import { stringAppender } from './stream-utils/string-appender'
import { EventEmitter } from 'events'
import { TaskNotFoundError } from './errors'

enum TaskRunnerEvents {
  REGISTER_TASK = 'register_task',
  REMOVE_TASK = 'remove_task',
  START_TASK = 'start_task',
  TASK_STAGE_UPDATE = 'task_stage_update'
}

export class TaskRunner extends EventEmitter {
  static readonly Events = TaskRunnerEvents
  tasks: { [key: string]: TaskHandler } = {}
  globalPipes: Set<Writable> = new Set([process.stdout])

  private getTask(taskKey: string) {
    const task = this.tasks[taskKey];
    if(!task) throw new TaskNotFoundError(taskKey)
    return task
  }

  registerTask(task: Task) {
    const taskKey = task.name + '-' + Math.floor(Math.random() * Date.now())
    const handler = new TaskHandler(task)
    this.tasks[taskKey] = handler
    this.globalPipes.forEach(pipe => this.addTaskPipe(taskKey, pipe))
    handler.on(TaskHandler.Events.STAGE_UPDATE, stages =>
      this.emit(TaskRunner.Events.TASK_STAGE_UPDATE, { taskKey, stages })
    )
    handler.on('close', () => this.removeTask(taskKey))
    this.emit(TaskRunner.Events.REGISTER_TASK, taskKey)
    return taskKey
  }

  startTask(...taskKeys: string[]) {
    taskKeys.forEach(taskKey => {
      this.getTask(taskKey).step()
      this.emit(TaskRunner.Events.START_TASK, taskKey)
    })
  }

  removeTask(taskKey: string) {
    const task = this.getTask(taskKey).task
    delete this.tasks[taskKey]
    this.emit(TaskRunner.Events.REMOVE_TASK, taskKey)
  }

  cancelTask(taskKey: string) {
    this.getTask(taskKey).cancel()
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
    this.getTask(taskKey).pipe(writable)
    writable.on('close', () => this.removeTaskPipe(taskKey, writable))
  }

  removeTaskPipe(taskKey: string, writable: Writable) {
    this.getTask(taskKey).unpipe(writable)
  }
}
