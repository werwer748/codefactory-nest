import { Body, Controller, Headers, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MaxLengthPipe, MinLengthPipe, PasswordPipe } from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    }
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    }
  }

  //* 기존 입력값으로 토큰 발행
  // @Post('login/email')
  // loginEmail(
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return this.authService.loginWithEmail({
  //     email,
  //     password,
  //   })
  // }

  //* 베이직 토큰을 통해 입력값을 받아 토큰 발행
  @Post('login/email')
  //* 가드 사용하기!
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') rawToken: string,
  ) {
    //* email:password -> base64
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials)
  }

  @Post('register/email')
  postRegisterEmail(
    @Body() body: RegisterUserDto,
  ) {
    return this.authService.registerWithEmail(body)
  }
}
