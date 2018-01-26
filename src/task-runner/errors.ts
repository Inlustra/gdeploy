class TaskNotFoundError extends Error {
  constructor(key?: string) {
    super(`${key ? `[${key}]` : ''} Task not found`)
  }
}

class TaskAlreadyFinishedError extends Error {
  constructor(key?: string) {
    super(`${key ? `[${key}]` : ''} Task has already completed.`)
  }
}

export { TaskNotFoundError, TaskAlreadyFinishedError }
