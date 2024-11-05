import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from '../../common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-image.dto';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from '../../common/const/path.const';
import { promises } from 'fs';
import { PostsModel } from '../entity/posts.entity';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr? qr.manager.getRepository<ImageModel>(ImageModel) : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    // dto의 이미지 이름을 기반으로 파일의 경로를 생성
    const tempFilePath = join(
      TEMP_FOLDER_PATH,
      dto.path
    );

    try {
      // 파일이 존재하는지 확인 - 없을시 에러
      await promises.access(tempFilePath);
    } catch (e) {
      throw new BadRequestException('존재하지 않는 파일 입니다.');
    }

    // 파일의 이름만 가져오기
    const filename = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    const newPath = join(
      POST_IMAGE_PATH,
      filename
    );

    // 이미지모델 저장
    const result = await repository.save({
      ...dto
    })

    // 파일 옮기기 - rename(기존 경로, 새로운 경로)
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}