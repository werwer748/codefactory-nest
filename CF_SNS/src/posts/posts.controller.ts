import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put } from '@nestjs/common';
import { PostsService } from './posts.service';

/**
 * @Controller
 * 첫번째 파라미터로 어떤 값(스트링)을 넣게되면
 * 이 클래스 안에 모든 엔드포인트들 앞에 패스에 접두어를 붙이는 역할을 한다.
 * (prefix를 붙이는 역학을 한다~)
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //* GET /posts => 모든 post를 가져온다.
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  //* GET /posts/:id => id에 해당하는 post를 가져온다.
  @Get(':id') //? : 으로 패스파라미터 선언
  //* @Param으로 가져올 파라미터의 이름을 지정해야 함.
  getPost(@Param('id') id: string) { //? 패스파라미터는 별도의 작업이 없으면 무조건 스트링으로 들어옴.
    return this.postsService.getPostById(+id)
  }

  //* POST /posts => post를 생성한다.
  @Post()
  postPost(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(authorId, title, content);
  }

  //* PATCH /posts/:id => id에 해당하는 post를 변경한다.
  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    //? 수정을 요청한 값만 변경하도록 옵셔널 처리
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, title, content);
  }

  //* DELETE /posts/:id => id에 해당하는 post를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
