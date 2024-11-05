import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ChatsMessagesService } from './messages.service';
import { PaginateMessageDto } from './dto/paginate-message.dto';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: ChatsMessagesService
  ) {}

  @Get()
  paginateMessages(
    @Param('cid', ParseIntPipe) cid: number,
    @Query() dto: PaginateMessageDto
  ) {
    return this.messagesService.paginateChatsMessages(
      dto,
      {
        where: {
          chat: {
            id: cid
          }
        },
        relations: {
          author: true,
          chat: true
        }
      }
    )
  }
}