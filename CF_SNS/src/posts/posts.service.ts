import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { PostsModel } from './entity/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ConfigService } from '@nestjs/config';
import { join, basename } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from '../common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from '../common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

/**
 * @Injectable?
 * => 직역해보면 주입할 수 있다??
 * @Module의 providers에 원하는 클래스를 등록해 놓으면 DI용도로 클래스를 사용할 수 있는데
 * 그러기 위해서는 이 데코레이터를 달아줘야지만 프로바이더로 사용할 수 있다.
 */
@Injectable()
export class PostsService {
  /**
   * Repository?
   * 사용할 엔티티를 typeorm에서 제공해주는 Repository에 제네릭을 써서 생성자 주입
   *
   * @InjectRepository?
   * => 특수한 형태기 때문에 해당 데코레이터를 선언해 줄 필요가 있다.
   */
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * repository의 모든 함수는 async!
   * 컨트롤러에서 서비스가 바로 반환되서 꼭 붙여야하는건 아니지만
   * 추후 로직이 복잡해질 때는 필요해 질 수 있기에 붙여서 작성
   */
  async getAllPosts() {
    //* find안에 조건을 걸어서 추린 데이터를 가져올 수 있음
    return this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS
    });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
        images: [],
      })
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto);
    // } else {
    //   return this.cursorPaginatePosts(dto);
    // }
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        ...DEFAULT_POST_FIND_OPTIONS
      },
      'posts'
    )
  }

  async getPostById(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    //* 하나의 데이터를 찾을 때 findOne을 사용
    const post = await repository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        id: postId
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  getRepository(qr?: QueryRunner) {
    return qr? qr.manager.getRepository<PostsModel>(PostsModel) : this.postsRepository;
  }

  async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner): Promise<PostsModel> {
    /**
     * 1) create -> 저장할 객체를 생성
     * => 사용시 자동완성을 제공받을 수 있기 때문에 편하다.
     *
     * 2) save -> 객체를 저장한다.
     * => create 메서드에서 생성한 객체로 save 하는 것이 일반적이고
     *    안전한 방법 (경우에따라 save에 바로 객체를 넣는 것도 가능)
     */

      // 쿼리러너안에서 실행된다면 쿼리러너에서 레포지토리를 가져온다
    const repository = this.getRepository(qr);

      //* PostsModel 기반의 레포지토리 - PostsModel의 프로퍼티만 입력이 가능하다.
    const post = repository.create({
        //? 관계가 생기면서 UsersModel이 들어가게 되는데 user의 id만 넣어줘도 관계 설정에는 문제가 없다.
        author: {
          id: authorId,
        },
        ...postDto,
        images: [],
        likeCount: 0,
        commentCount: 0,
      });

    const newPost = await repository.save(post);

    return newPost;
  }

  async updatePost(postId: number, { title, content }: UpdatePostDto) {
    /**
     * save를 통해 변경된 데이터를 저장할 수 있다.
     *
     * 1) 만약 해당 id의 데이터가 존재하지 않으면 새로 생성함.
     * 2) 만약 해당 id의 데이터가 존재한다면 값을 업데이트 한다.
     *
     * findOne으로 DB에서 가져온 데이터는 id가 존재하기 떄문에 업데이트!
     */
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    //* if문안에서 바뀐값들로 업데이트
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(postId);

    return postId;
  }

  async checkPostExistsById(id: number) {
    return this.postsRepository.exists({
      where: {
        id
      }
    })
  }

  //! 예제를 위해 남겨뒀지만 사용하지 않음
  // async pagePaginatePosts(dto: PaginatePostDto) {
  //   const [posts, count] = await this.postsRepository.findAndCount({
  //     skip: dto.take * (dto.page - 1),
  //     take: dto.take,
  //     order: {
  //       createdAt: dto.order__createdAt,
  //     }
  //   });
  //
  //   return {
  //     data: posts,
  //     total: count,
  //   }
  // }
  //
  // async cursorPaginatePosts(dto: PaginatePostDto) {
  //   // 스트링으로 변수 담아놓고 쓰기
  //   const whereIdLessThanKey: keyof PaginatePostDto = 'where__id__less_than';
  //   const whereIdMoreThanKey: keyof PaginatePostDto = 'where__id__more_than';
  //
  //   const where: FindOptionsWhere<PostsModel> = {}
  //
  //   if (dto.where__id__less_than) {
  //     where.id = LessThan(dto.where__id__less_than)
  //   }
  //   if (dto.where__id__more_than) {
  //     where.id = MoreThan(dto.where__id__more_than)
  //   }
  //
  //   const posts = await this.postsRepository.find({
  //     where,
  //     order: { createdAt: dto.order__createdAt },
  //     take: dto.take,
  //   });
  //
  //   const lastItem = posts.length === dto.take ? posts.at(-1) : null;
  //
  //   const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
  //   const host = this.configService.get<string>(ENV_HOST_KEY);
  //
  //   const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);
  //
  //   if (nextUrl) {
  //     for (const key of Object.keys(dto)) {
  //       if (dto[key]) {
  //         if (key !== whereIdLessThanKey && key !== whereIdMoreThanKey) {
  //           nextUrl.searchParams.append(key, dto[key]);
  //         }
  //       }
  //     }
  //
  //     const key =
  //       dto.order__createdAt === 'ASC' ? whereIdMoreThanKey : whereIdLessThanKey
  //
  //     nextUrl.searchParams.append(key, lastItem.id.toString())
  //   }
  //
  //   return {
  //     data: posts,
  //     cursor: {
  //       after: lastItem?.id ?? null
  //     },
  //     count: posts.length,
  //     next: nextUrl?.toString() ?? null,
  //   };
  // }
}
