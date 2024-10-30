import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  //* 이전 데이터의 마지막 데이터 ID - 오름차순을 위해
  // @Type(() => Number) - 전역설정 없을시 타입변형
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  //* 생성일 기준 오름차/내림차순
  @IsIn(['ASC', 'DESC']) // [] 안의 값들만 허용이 된다.
  @IsOptional()
  order__createdAt?: 'ASC' | 'DESC' = 'ASC';

  //* 가져올 데이터의 갯수
  @IsNumber()
  @IsOptional()
  take: number = 20;
}