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
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';

@Module({
  //* 다른 모듈을 불러올 때 사용하는 속성
  imports: [
    // 앱모듈에서 인젝트하고있는 상황 -> TypeOrmModule에 적용하기가 어렵다.
    ConfigModule.forRoot({
      //? 환경변수 파일 이름 오른쪽 파일 기준으로 중복값은 덮어 씌운다.
      envFilePath: ['.env.dev', '.env.prod', '.env'],
      //? 앱에서 전역적으로 사용할 수 있게끔 설정
      isGlobal: true,
    }),
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
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env[ENV_DB_HOST_KEY],
    //   port: parseInt(process.env[ENV_DB_PORT_KEY]),
    //   username: process.env[ENV_DB_USERNAME_KEY],
    //   password: process.env[ENV_DB_PASSWORD_KEY],
    //   database: process.env[ENV_DB_DATABASE_KEY],
    //   entities: [
    //     //* 생성한 모델 클래스를 등록
    //     PostsModel,
    //     UsersModel
    //   ],
    //   synchronize: true,
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(ENV_DB_HOST_KEY),
        port: configService.get<number>(ENV_DB_PORT_KEY),
        username: configService.get<string>(ENV_DB_USERNAME_KEY),
        password: configService.get<string>(ENV_DB_PASSWORD_KEY),
        database: configService.get<string>(ENV_DB_DATABASE_KEY),
        entities: [
          //* 생성한 모델 클래스를 등록
          PostsModel,
          UsersModel
        ],
        synchronize: true,
      }),
    }),
    //* 스태틱 파일 서빙 모듈
    ServeStaticModule.forRoot({
      // 이렇게만 추가하면 주소/posts/이미지.jpg로만 요청하게 된다.
      rootPath: PUBLIC_FOLDER_PATH,
      // prefix를 붙여서 주소/public/posts/이미지.jpg로 요청할 수 있게 한다.
      serveRoot: '/public',
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
