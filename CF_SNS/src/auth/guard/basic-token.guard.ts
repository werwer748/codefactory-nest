import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * 1) 요청 객체를 불러오고 authorization header로 부터 토큰을 가져온다.
 *
 * 2) authService.extractTokenFromHeader를 이용해서
 *    사용할 수 있는 형태의 토큰을 추출한다.
 *
 * 3) authService.decodeBasicToken을 실행해서
 *    email과 password를 추출한다.
 *
 * 4) email과 password를 이용해서 사용자를 가져온다.
 *    (authService.authenticateWithEmailAndPassword
 *
 * 5) 요청이 모두 처리되어 클라이언트로 나가는 순간까지
 *    찾아낸 사용자를 (1)의 요청 객체에 붙여준다.
 *     req.user = user;
 */
@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService
  ) {}
  /**
   * context: 요청 객체를 가져오는데 사용한다.
   *
   * 반환에 boolean을 쓰는 이유?
   * true, false로 들어온 요청이 가드를 통과할 수 있는지를 알려주기 위해
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //* http 통신의 request를 가져온다.
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    //* 가져온 토큰으로 유저정보 가져오기
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    //* 가져온 사용자 정보를 요청 객체에 담는다.
    req.user = user;

    return true;
  }
}