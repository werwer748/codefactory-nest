import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import {v4 as uuid} from 'uuid';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from './const/path.const';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,

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
          callback(null, TEMP_FOLDER_PATH);
        },
        filename(req, file, callback) {
          // 저장할 때 파일이름을 지정한다.
          callback(null, `${uuid()}${extname(file.originalname)}`);
        }
      })
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
