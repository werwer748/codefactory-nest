import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Or, Repository } from 'typeorm';
import { ChatsModel } from './entity/chats.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CommonService } from '../common/common.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(dto: PaginateChatDto) {
    //* 별다른 코딩 작업없이 간단하게 데이터를 페이지네이션하여 가져올 수 있다.
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: {
          users: true
        }
      },
      'chats'
    )
  }

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      /**
       * ManyToMany
       * => users필드에 던져준 userId만큼 중간테이블에 현재 함수에서 생성된 챗 로우와
       * 맵핑된 데이터가 생성된다.
       */
      users: dto.userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: { id: chat.id }
    });
  }

  async checkIfChatExists(chatIds: number[]) {
    // 데이터가 존재하는지만 체크
    // 1. 카운트로 갯수비교하기
    const chatsCount = await this.chatsRepository.count({
      where: {
        id: In(chatIds),
      }
    });

    // 2. 데이터가 존재하는지 exists로 확인 - 이 경우 id를 하나하나 받아서 검사해야 함
    // const exists = await this.chatsRepository.exists({
    //   where: {
    //     id: chatId_하나
    //   }
    // }) // => true면 채팅이 존재 false면 채팅이 X

    return chatsCount === chatIds.length;
  }
}
