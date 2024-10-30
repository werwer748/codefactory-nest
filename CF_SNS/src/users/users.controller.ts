import { Body, ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //! 회원가입은 auth를 통해서만
  // @Post()
  // postUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return this.usersService.createUser({
  //     nickname,
  //     email,
  //     password
  //   });
  // }

  @Get()
  //* 데코레이터를 달아주면 @Exclude가 선언된 프로퍼티는 제외하고 데이터를 가져온다.
  // @UseInterceptors(ClassSerializerInterceptor)
  /**
   * serialization
   * -> 직렬화
   * -> 현재 시스템(NestJS)에서 사용되는 데이터의 구조를
   *    다른 시스템에서도 쉽게 사용할 수 있는 포맷으로 변환
   * -> class의 object에서 JSON 포맷으로 변환
   *
   * deserialization -> 역직렬화
   * UsersModel의 인스턴스형태를 반환 받아오는데
   * 이 데이터가 응답으로 나가면서 JSON으로 변환될 때 클래스를
   * 인터셉터에서 직렬화 해주는것
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
