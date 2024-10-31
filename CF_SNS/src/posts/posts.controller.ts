import {
  Body,
  Controller, DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put, UseGuards, Request, Query, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { UsersModel } from '../users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * @Controller
 * 첫번째 파라미터로 어떤 값(스트링)을 넣게되면
 * 이 클래스 안에 모든 엔드포인트들 앞에 패스에 접두어를 붙이는 역할을 한다.
 * (prefix를 붙이는 역학을 한다~)
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //* 게시글 데이터 생성용 API
  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }

  //* GET /posts => 모든 post를 가져온다.
  @Get()
  getPosts(
    // 쿼리스트링 가져오기
    @Query() query: PaginatePostDto
  ) {
    return this.postsService.paginatePosts(query)
  }

  //* GET /posts/:id => id에 해당하는 post를 가져온다.
  @Get(':id') //? : 으로 패스파라미터 선언
  //* @Param으로 가져올 파라미터의 이름을 지정해야 함.
  //? ParseIntPipe로 정수로 변경했기 때문에 타입은 number가 된다. - 정수로 못바꾸는 값이면 에러
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id)
  }

  //* POST /posts => post를 생성한다.
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(
    @User('id') userId: number,
    //* body를 통째로 Dto 형태로 받는다.
    @Body() body: CreatePostDto,
  ) {
    await this.postsService.createPostImage(body);

    return this.postsService.createPost(
      userId, body
    );
  }

  //* PATCH /posts/:id => id에 해당하는 post를 변경한다.
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto
  ) {
    return this.postsService.updatePost(id, body);
  }

  //* DELETE /posts/:id => id에 해당하는 post를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
