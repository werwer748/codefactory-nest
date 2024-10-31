import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';

@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService
  ) {}

  // 선 업로드 api
  @Post('image')
  // 이미지 받아올 인터셉터 파일인터셉터('이미지올린 프로퍼티명')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AccessTokenGuard)
  postImage(
    // nest에서 제공하는 파일 가져오는 데코레이터
    @UploadedFile() file: Express.Multer.File
  ) {
    return { fileName: file.filename }
  }
}
