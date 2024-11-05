import { PickType } from '@nestjs/mapped-types';
import { MessagesModel } from '../entities/messages.entity';
import { IsNumber } from 'class-validator';

export class CreateMessagesDto extends PickType(MessagesModel, ['message']) {
  @IsNumber()
  chatId: number;

  //! 임시로.. 소켓에서 토큰가져오는기능 추가할 떄까지
  @IsNumber()
  authorId: number;
}