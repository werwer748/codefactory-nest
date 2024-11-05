import { BaseModel } from './base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { join } from 'path';
import { POST_IMAGE_PATH, POST_PUBLIC_IMAGE_PATH } from '../const/path.const';
import { PostsModel } from '../../posts/entity/posts.entity';

export enum ImageModelType {
  POST_IMAGE = 'POST_IMAGE'
}

@Entity()
export class ImageModel extends BaseModel {
  // 보여주고 싶은 이미지 순서
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  /**
   * @Transform()? class-transformer에서 제공
   * 함수를 넣어서 사용
   * value: 실제 데이터에서 넘어온 프로퍼티의 값
   * obj: 현재 객체 - ImageModel이 인스턴스화 됐을 때의 객체
   */
  @Transform(({value, obj}) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return `/${join(
        POST_PUBLIC_IMAGE_PATH,
        value,
      )}`
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => PostsModel, post => post.images)
  post?: PostsModel;
}