import { Get, Controller, Post, Res, Body, HttpStatus } from "@nestjs/common";
import { Push } from "./model/github-push";

@Controller()
export class AppController {
  @Get()
  root(): string {
    return "Hello World!";
  }

  @Post("/push")
  async onGitHook(@Res() res, @Body() gitPush: Push) {
    res.status(HttpStatus.CREATED).send();
  }
}
