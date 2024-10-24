import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

interface IPost {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

/**
 * @Controller
 * 첫번째 파라미터로 어떤 값(스트링)을 넣게되면
 * 이 클래스 안에 모든 엔드포인트들 앞에 패스에 접두어를 붙이는 역할을 한다.
 * (prefix를 붙이는 역학을 한다~)
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 메소드 데코레이터에 첫번째 파라미터에
   * 원하는 패스를 입력해주면 이 패스에 맞게
   * 엔드포인트를 맵핑할 수 있다.
   */
  @Get()
  getPost(): IPost {
    return {
      author: 'newjeans_official',
      title: '뉴진스님 민지',
      content: '디제잉하는 뉴진 스님',
      likeCount: 1000000,
      commentCount: 999999
    };
  }
}
