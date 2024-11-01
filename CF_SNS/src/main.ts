import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception-filter/http.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * app.useGlobalPipes()
   *  => app에 전반적으로 적용할 파이프를 넣는다.
   *
   *  app.useGlobalPipes(new ValidationPipe())
   *  => class-validator의 검증을 앱에 전역적으로 사용
   */
  app.useGlobalPipes(
    new ValidationPipe({
      // dto에 선언되는 클래스의 기본값을 허용해준다.
      transform: true,
      // transform 세부옵션
      transformOptions: {
        // validator의 IsNumber등으로 타입을 유추해서 자동으로 타입을 변환시켜 준다.
        enableImplicitConversion: true,
      },
      // 이 옵션을 켜면 validation 데코레이터가 선언되어있지 않은 프로퍼티는 모두 삭제한다.
      whitelist: true,
      // 데코레이터로 허용한 프로퍼티가 잘못되었거나 이상한 프로퍼티를 보내면 에러를 발생시킨다.
      forbidNonWhitelisted: true,
    })
  );

  // app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
