import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_HASH_ROUNDS_KEY, ENV_JWT_SECRET_KEY } from '../common/const/env-keys.const';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
        secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
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

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const findUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(findUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    //* 비밀번호 해쉬 - salt는 bcrypt.hash하면 자동으로 생성됨.
    const hash = await bcrypt.hash(
      user.password, //? 원본 비밀번호
      //* 정수로 취급되어야 하기 떄문에 int로 변형
      parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)), //? 해시 라운드: 라운드를 많이 돌릴수록 시간이 오래걸리고 보안속도가 올라간다. npmjs 참고
    );

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }

  //* 토큰 추출 함수 { authorization: 종류 {토큰} }
  extractTokenFromHeader(header: string, isBearer: boolean) {
    // Basic {token}, Bearer {token} - 헤더의 authorization 값은 띄어쓰기를 기준으로 나눈다.
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    // 잘못된 값이 넘어오는 경우를 항상 가정해야한다!
    if (
      splitToken.length !== 2 // 띄어쓰기가 여러개인 경우
      || splitToken[0] !== prefix // prefix가 Bearer, Basic 중 그 무엇도 아닌 경우
    ) {
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    const token = splitToken[1];

    return token;
  }

  //* Basic ;lkajsdlkajsdlkds -> email:password -> return { email, password }
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password
    }
  }

  //* JWT Token 검증
  verifyToken(token: string) {
    try {
      //* 토큰안의 payload 반환
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      });
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.')
    }
  }

  //* 만료된 토큰 재발급
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    });

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('토큰 재발급은 Refresh 토큰으로만 가능합니다!');
    }

    return this.signToken(
      {
        id: decoded.sub,
        email: decoded.email
      },
      isRefreshToken
    );
  }
}
