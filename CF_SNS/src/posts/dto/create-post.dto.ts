import { PostsModel } from '../entity/posts.entity';
import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

/**
 * ts의 유틸리티
 * Pick, Omit, Partial -> Type을 반환
 * ts의 유틸리티 처럼 사용할 수 있는 것들
 * PickType, OmitType, PartialType -> 값을 반환
 */

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    // string[]의 값을 각각 검증
    each: true
  })
  @IsOptional()
  images: string[] = [];
}