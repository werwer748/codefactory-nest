import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

/**
 * @Module?
 * => PostsModule 클래스는 모듈이라는 것을 정의해준다.
 * 각 속성에 등록시 인스턴스화 하지않고 클래스를 그대로 집어 넣는다.
 * => IoC Container가 자동으로 인스턴스화 해서 관리하게끔 하는 것.
 *
 * controllers:
 * 컨트롤러로 사용할 클래스를 등록한다.
 * 이렇게 등록되어야 특정 경로의 요청이 등록한 컨트롤러로 라우팅 되는 것.
 *
 * providers:
 * 생성자를 통해 주입하는 클래스들을 모두 등록하는 곳이라고 보면 된다.
 * 이곳에 등록된 모든 클래스들을 인스턴스화 없이 IoC Container에 맡기고 사용할 수 있음
 * 이곳에 등록이 되어야 주입을 해주고 정상적으로 서비스가 올라감
 * 여기에 등록되는 클래스에는 @Injectable을 달아줘야 함
 * 정상적으로 등록된 클래스는 이 모듈안의 어떤 곳에서든 사용할 수 있게 된다.
 */
@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
