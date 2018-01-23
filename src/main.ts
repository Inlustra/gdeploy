import { NestFactory } from "@nestjs/core";
import { ApplicationModule } from "./app.module";
import config from "./config";

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(config.port);
}

bootstrap();
