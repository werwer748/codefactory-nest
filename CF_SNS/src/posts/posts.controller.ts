import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { UsersModel } from '../users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entities/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/images.service';

/**
 * @Controller
 * 첫번째 파라미터로 어떤 값(스트링)을 넣게되면
 * 이 클래스 안에 모든 엔드포인트들 앞에 패스에 접두어를 붙이는 역할을 한다.
 * (prefix를 붙이는 역학을 한다~)
 */
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postImageService: PostsImagesService,
    // 트랜잭션 사용을 위해 dataSource를 가져온다.
    private readonly dataSource: DataSource
  ) {}

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
    // 쿼리러너 생성 - 트랜잭션과 관련된 모든 쿼리를 담당
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결
    await qr.connect();
    // 쿼리 러너에서 트랜잭션 시작 - 이 시점부터 쿼리러너를 사용하면 트랜잭션 안에서 DB 액션을 실행
    await qr.startTransaction();

    // 로직 실행
    try {
      const post = await this.postsService.createPost(
        userId, body, qr
      );

      for (let i = 0; i < body.images.length; i++) {
        await this.postImageService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        }, qr);
      }

      // 트랜잭션 저장을 DB에 반영
      await qr.commitTransaction();

      return this.postsService.getPostById(post.id);
    } catch (e) {
      // 어떤 에러든 발생하면 트랜잭션을 종료하고 원래 상태로 되돌린다.
      await qr.rollbackTransaction();
      throw new InternalServerErrorException('생성에러');
    } finally {
      // 트랜잭션을 종료하고 커넥션풀 반남
      await qr.release();
    }
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
