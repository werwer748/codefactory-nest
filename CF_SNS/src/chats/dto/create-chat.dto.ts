import { IsNumber } from 'class-validator';

export class CreateChatDto {
  // @IsNumber(어떤 숫자인지, 배열사용시 각각 검사
  @IsNumber({}, { each: true })
  userIds: number[];
}