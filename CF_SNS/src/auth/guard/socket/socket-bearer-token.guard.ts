import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //* 웹소켓 가져오기
    const socket = context.switchToWs().getClient();

    const header = socket.handshake.headers;

    const rawToken = header['authorization'];

    if (!rawToken) {
      throw new WsException('토큰이 유효하지 않습니다!');
    }

    // 기본적으로 http에러를 던지기 떄문에 다시 웹소켓 에러로 던져준다.
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;
      socket.token = token;
      socket.tokeType = payload.tokeType;

      return true;
    } catch (e) {
      throw new WsException('토큰이 유효하지 않습니다!');
    }
  }
}