import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * app.useGlobalPipes()
   *  => app에 전반적으로 적용할 파이프를 넣는다.
   *
   *  app.useGlobalPipes(new ValidationPipe())
   *  => class-validator의 검증을 앱에 전역적으로 사용
   */
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
