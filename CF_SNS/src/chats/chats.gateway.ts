import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { ChatsMessagesService } from './messages/messages.service';

@WebSocketGateway({
  /**
   * namespace 지정
   * ws://localhost:3000/chats
   */
  namespace: 'chats',
})
/**
 * onConnect: socket.on
 */
export class ChatsGateway implements
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    // ChatService 주입
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatsMessagesService,
  ) {}

  afterInit(server: Server) {
    console.log('웹소켓 서버 초기화~! 올라왔어용~!')
  }

  //* 메시지를 보내기 위해 필요 -
  @WebSocketServer()
  server: Server // const io = new Server(3000)

  //? 인자로 받는 socket의 타입은 socket.io에서 불러온 Socket이어야 한다!
  handleConnection(socket: Socket) {
    console.log(`on connect called : ${socket.id}`);
  }

  //* 채팅방만들기
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  /** 이벤트 리스닝
   * socket.on('send_message', (message) => { console.log(message) })
   * @SubscribeMessage('이벤트 이름')
   * @MessageBody() => 받은 메시지
   */
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket,
  ) {
    //? 기본 메시지 받기
    // console.log(message);

    //? 이벤트 들어오면 서버에서 클라이언트로 메시지를 보내기
    // this.server.emit('receive_message', { hello: 'world' });

    //? 이벤트 들어오면 서버에서 클라이언트로 지정한 룸들에만 메시지를 보내기
    // this.server.in(message.chatId.toString()).emit('receive_message', message.message);

    //? 요청자에게만 메시지가 들어온다. - 단 본인이 이벤트를 리스닝하고 있어야 한다.
    // socket.emit('receive_message', 'hi');

    //? socket.to(특정 룸).emit => 이 방에 나를 제외한 다른 소켓들에 메시지가 나간다. Broadcast
    // socket.to(message.chatId.toString()).emit('receive_message', message.message);
    /**
     * 정리
     * this.server?
     * => 필터링한 방 안에 있는 모든 소켓들한테 메시지가 나간다.
     * socket.to?(BroadCasting 기능)
     * => 지정한 방 안에 현재 소켓(요청자)를 제외한 나머지에게 메시지를 보낸다.
     */

    //* 실제 메시지 보내기
    const chatExists = await this.chatsService.checkIfChatExists([ dto.chatId ]);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID: ${dto.chatId}`
      )
    }

    const message = await this.messageService.createMessage(
      dto
    );

    socket.to(message.chat.id.toString()).emit("receive_message", message.message);
  }

  /**
   * join room
   */
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    // 현재 이 함수에 연결된 socket
    @ConnectedSocket() socket: Socket,
  ) {
    const exists = await this.chatsService.checkIfChatExists(data.chatIds);

    if (!exists) {
      /**
       * WsException
       * 클라이언트에서는 exception이라는 이벤트를 리스닝중이어야 한다.
       */
      throw new WsException({
        code: 100,
        message: `존재하지 않는 chatId가 있습니다.`,
      });
    }
    // room 이름은 string, string[]만 가능
    socket.join(data.chatIds.map((x) => x.toString()));
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
      console.log('disconnected bye bye', socket.nsp.name);
  }
}