import { Get, Controller, Post, Res, Body, HttpStatus } from '@nestjs/common'
import { Push } from './model/github-push'
import { TaskRunner } from './task-runner/task-runner'

@Controller()
export class AppController {
  constructor(private taskRunner: TaskRunner) {}

  @Get()
  root(): string {
    return 'Hello World!'
  }

  @Post('/push')
  async onGitHook(@Res() res, @Body() gitPush: Push) {
    res.status(HttpStatus.CREATED).send()
  }
}
