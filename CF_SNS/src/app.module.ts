import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  //* 다른 모듈을 불러올 때 사용하는 속성
  imports: [
    /**
     * typeorm module을 추가
     *
     * forRoot로 nest와 typeorm의 연결고리를 만든다.
     * 내부옵션으로 db연결 정보를 입력
     * entities: 테이블 모델
     * synchronize: 여기서 바꾸는 테이블 정보를 DB에 반영할지 정하는 옵션
     * => 개발중엔 true여도 되지만 배포시 무조건 false로 해야함
     *
     * 추후 이 연결 정보들은 환경변수로 빼는것이 좋다.
     */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [
        //* 생성한 모델 클래스를 등록
        PostsModel,
        UsersModel
      ],
      synchronize: true,
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ],
})
export class AppModule {}
