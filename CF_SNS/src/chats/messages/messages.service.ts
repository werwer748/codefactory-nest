import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './entities/messages.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import { PaginateMessageDto } from './dto/paginate-message.dto';
import { CreateMessagesDto } from './dto/create-messages.dto';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async createMessage(
    dto: CreateMessagesDto,
    authorId: number
  ) {
    // 메시지 데이터 생성 - 연관관계는 id만 넣어줘서 매핑
    const message = await this.messagesRepository.save({
      chat: {
        id: dto.chatId,
      },
      author: {
        id: authorId,
      },
      message: dto.message
    });

    return this.messagesRepository.findOne({
      where: {
        id: message.id,
      },
      relations: {
        author: true,
        chat: true
      }
    })
  }

  paginateChatsMessages(
    dto: PaginateMessageDto,
    overrideOptions: FindManyOptions<MessagesModel>
  ) {
    return this.commonService.paginate(
      dto,
      this.messagesRepository,
      overrideOptions,
      'messages'
    )
  }
}
