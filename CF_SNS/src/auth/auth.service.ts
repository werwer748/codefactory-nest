import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * 구현할 기능 목록
 *
 * 1) registerWithEmail(회원가입)
 *    - email, nickname, password를 입력받고 사용자를 생성
 *    - 생성이 완료되면 accessToken과 refreshToken을 반환한다.
 *
 * 2) loginWithEmail(로그인)
 *    - email, password를 입력하면 사용자 검증을 진행한다.
 *    - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
 *
 * 3) loginUser
 *    - 1 과 2 에서 필요한 accessToken과 refreshToken을 반환하는 로직
 *
 * 4) signToken
 *    - 3 에서 필요한 accessToken과 refreshToken을 sign하는 로직
 *
 * 5) authenticateWithEmailAndPassword
 *    - 2 에서 로그인을 진행할 때 필요한 기본적인 검증을 진행
 *      1. 사용자가 존재하는지 확인(email)
 *      2. 비밀번호 검증
 *      3. 모두 통과되면 찾은 사용자 정보 반환
 *      4. 데이터를 기반으로 토큰 생성
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Payload 정보
   *
   * 1) email
   * 2) sub -> user pk
   * 3) type: 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(
      payload,
      {
        secret: JWT_SECRET,
        // seconds
        expiresIn: isRefreshToken ? 3600 : 300,
      }
    );
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    }
  }

  async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
    //* 유저 정보를 확인하는 로직이기 떄문에 유저쪽에 구현하고 가져다 쓰는게 보기에도 깔끔하고 좋다.
    /**
     * 3. 모두 통과되면 찾은 사용자 정보 반환
     */
    // 1. 사용자가 존재하는지 확인(email)
    const findUser = await this.usersService.getUserByEmail(user.email);

    if (!findUser) {
      throw new UnauthorizedException('존재하지 않는 사용자 입니다.');
    }

    // 2. 비밀번호 검증
    //* bcrypt.compare(입력된 비밀번호, 저장 되어있는 hash)
    const passOk = await bcrypt.compare(user.password, findUser.password);
    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return findUser;
  }
}
