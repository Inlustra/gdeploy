import { Task } from '../../models/task.model'
import { Job } from '../../models/job.model'
import { echoJob } from '../../../jobs/echo.job'
import { lsJob } from '../../../jobs/ls.job'
import { exitJob } from '../jobs/exit.job'
import { gitCloneJob } from '../../../jobs/git-clone.job'
import { shJob } from '../../../jobs/sh.job'

function sleepEchoTask(echo1: string, sleepTime: string, echo2: string): Task {
  return {
    name: 'Successful Test Task',
    description: 'A task to list a directory',
    jobs: [shJob('sleep ' + sleepTime), echoJob(echo2)]
  }
}

function successfulTask(directory: string): Task {
  return {
    name: 'Successful Test Task',
    description: 'A task to list a directory',
    jobs: [echoJob('Wooooooop!'), lsJob(directory)]
  }
}

function errorTask(directory: string, code: number): Task {
  return {
    name: 'Error Test Task',
    description: 'A task to list a directory',
    jobs: [echoJob('Wooooooop!'), exitJob(code), lsJob(directory)]
  }
}

function cloneAndRun(gitRepo: string, command: string): Task {
  const dir = '/tmp/clone_and_run_' + Math.floor(Math.random() * Date.now())
  return {
    name: 'Clone and Run',
    description: `Clone ${gitRepo}, ls the directory and then run ${command}`,
    jobs: [gitCloneJob(gitRepo, dir), lsJob(dir), shJob(command, { cwd: dir })]
  }
}

export { sleepEchoTask, successfulTask, errorTask, cloneAndRun }
