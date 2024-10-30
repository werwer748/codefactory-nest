import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
    private readonly postsRepository: Repository<PostsModel>
  ) {}

  /**
   * repository의 모든 함수는 async!
   * 컨트롤러에서 서비스가 바로 반환되서 꼭 붙여야하는건 아니지만
   * 추후 로직이 복잡해질 때는 필요해 질 수 있기에 붙여서 작성
   */
  async getAllPosts() {
    //* find안에 조건을 걸어서 추린 데이터를 가져올 수 있음
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async getPostById(postId: number) {

    //* 하나의 데이터를 찾을 때 findOne을 사용
    const post = await this.postsRepository.findOne({
      where: {
        id: postId
      },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    /**
     * 1) create -> 저장할 객체를 생성
     * => 사용시 자동완성을 제공받을 수 있기 때문에 편하다.
     *
     * 2) save -> 객체를 저장한다.
     * => create 메서드에서 생성한 객체로 save 하는 것이 일반적이고
     *    안전한 방법 (경우에따라 save에 바로 객체를 넣는 것도 가능)
     */

      //* PostsModel 기반의 레포지토리 - PostsModel의 프로퍼티만 입력이 가능하다.
    const post = this.postsRepository.create({
        //? id: DB에서 생성

        //? 관계가 생기면서 UsersModel이 들어가게 되는데 user의 id만 넣어줘도 관계 설정에는 문제가 없다.
        author: {
          id: authorId,
        },
        ...postDto,
        likeCount: 0,
        commentCount: 0,
      });

    const newPost = await this.postsRepository.save(post);

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
}
