import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TaskRunner } from './task-runner/task-runner';

@Module({
  imports: [],
  controllers: [AppController],
  components: [TaskRunner],
})
export class ApplicationModule {}
