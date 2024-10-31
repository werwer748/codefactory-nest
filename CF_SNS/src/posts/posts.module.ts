import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModel } from '../users/entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH } from '../common/const/path.const';

// 가장 많이 사용되는 v4 버전을 사용
import {v4 as uuid} from 'uuid';

/**
 * @Module?
 * => PostsModule 클래스는 모듈이라는 것을 정의해준다.
 * 각 속성에 등록시 인스턴스화 하지않고 클래스를 그대로 집어 넣는다.
 * => IoC Container가 자동으로 인스턴스화 해서 관리하게끔 하는 것.
 *
 * controllers:
 * 컨트롤러로 사용할 클래스를 등록한다.
 * 이렇게 등록되어야 특정 경로의 요청이 등록한 컨트롤러로 라우팅 되는 것.
 *
 * providers:
 * 생성자를 통해 주입하는 클래스들을 모두 등록하는 곳이라고 보면 된다.
 * 이곳에 등록된 모든 클래스들을 인스턴스화 없이 IoC Container에 맡기고 사용할 수 있음
 * 이곳에 등록이 되어야 주입을 해주고 정상적으로 서비스가 올라감
 * 여기에 등록되는 클래스에는 @Injectable을 달아줘야 함
 * 정상적으로 등록된 클래스는 이 모듈안의 어떤 곳에서든 사용할 수 있게 된다.
 */
@Module({
  //* 사용할 엔티티를 이렇게 import 해와서 써야함.
  imports: [
    //* .forFeature에 사용할 엔티티를 리스트로 넣어준다.
    TypeOrmModule.forFeature([
      PostsModel,
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
    // nest에서 제공하는 멀터모듈
    MulterModule.register({
      // 파일 크기 제한
      limits: {
        // 바이트 단위 입력 - 현재 10MB
        fileSize: 10000000,
      },
      // 이 필터를 잘 활용하면 왠만한 기능은 모두 구현할 수가 있다.
      fileFilter: (req, file, callback) => {
        /**
         * callback(에러, boolean)
         * 첫번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어 준다.
         * 두번째 파라미터에는 파일을 받을지 말지 boolean을 넣어준다.
         */
        const ext = extname(file.originalname);

        // 확장자를 검사하여 에러
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webp') {
          return callback(
            new BadRequestException('올바른 이미지 파일이 아닙니다.'),
            false
          );
        }

        // 통과시 파일 다운로드
        return callback(null, true);
      },
      // multer함수를 받는다.
      storage: multer.diskStorage({
        destination: (req, file, callback) => {
          // 다운받을 폴더 위치를 지정한다.
          callback(null, POST_IMAGE_PATH);
        },
        filename(req, file, callback) {
          // 저장할 때 파일이름을 지정한다.
          callback(null, `${uuid()}${extname(file.originalname)}`);
        }
      })
    })
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
