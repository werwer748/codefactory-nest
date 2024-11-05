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
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from '../common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from '../auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';


// 해당 게이트웨이 전체에 가드 적용
// @UseGuards(SocketBearerTokenGuard)
// 해당 게이트웨이 전체에 파이프 적용
@UsePipes(new ValidationPipe({
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  whitelist: true,
  forbidNonWhitelisted: true,
}))
// 해당 게이트웨이 전체에 ExceptionFIlter 적용
@UseFilters(SocketCatchHttpExceptionFilter)
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
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    console.log('웹소켓 서버 초기화~! 올라왔어용~!')
  }

  //* 메시지를 보내기 위해 필요 -
  @WebSocketServer()
  server: Server // const io = new Server(3000)

  //? 인자로 받는 socket의 타입은 socket.io에서 불러온 Socket이어야 한다!
  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called : ${socket.id}`);

    //* 이렇게 작성하는 것 만으로 유저 정보를 소켓에 담을 수 있다!
    // const user = await this.usersService.getUserByEmail('codingyo@codingyo.ai');
    // socket.user = user;

    // 가드의 로직을 그대로 가져와서 이곳에서 사용
    // => 실제 소켓 연결시에 토큰검사하고 통과되면 이후 인증이 필요 없어짐
    const header = socket.handshake.headers;

    const rawToken = header['authorization'];

    if (!rawToken) {
      // 토큰이 없으면 소켓 연결을 끊는다.
      socket.disconnect();
    }

    // 기본적으로 http에러를 던지기 떄문에 다시 웹소켓 에러로 던져준다.
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (e) {
      // 토큰이 없으면 소켓 연결을 끊는다.
      socket.disconnect();
    }
  }

  //* 채팅방만들기
  @SubscribeMessage('create_chat')
  // @UseGuards(SocketBearerTokenGuard)
  async createChat(
    @MessageBody() data: CreateChatDto,
    // 소켓에 연결된 사용자 정보 가져오기 (가드를 통해 넣은 정보)
    @ConnectedSocket() socket: Socket & { user: UsersModel }
  ) {
    const chat = await this.chatsService.createChat(
      data
    );
  }

  /** 이벤트 리스닝
   * socket.on('send_message', (message) => { console.log(message) })
   * @SubscribeMessage('이벤트 이름')
   * @MessageBody() => 받은 메시지
   */
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    // 가드를 통해 가져온 유저 정보 꺼내기 위해 타입 합치기
    @ConnectedSocket() socket: Socket & { user: UsersModel },
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
    const chatExists = await this.chatsService.checkIfChatExists([
      dto.chatId
    ]);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID: ${dto.chatId}`
      )
    }

    const message = await this.messageService.createMessage(
      dto,
      // 가드를 통해 소켓에 넣은 유저정보에서 id 값 가져오기
      socket.user.id
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
    @ConnectedSocket() socket: Socket & { user: UsersModel },
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
      console.log('disconnected bye bye', socket.id);
  }
}