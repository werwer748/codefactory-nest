import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// 응답 반환해보기 - nest에서 html을 반환하기위해서는 많은 코드가 필요해서 우선 스트링 반환
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //데코레이터를 비워두면 '/'와 똑같이 작동한다.
  @Get()
  getHello() {
    return 'Home Page'
  }

  // 굳이 / 안넣어도 됨
  @Get('post')
  getPost() {
    return 'Post Page'
  }

  @Get('user')
  getUser() {
    return 'User Page'
  }
}
