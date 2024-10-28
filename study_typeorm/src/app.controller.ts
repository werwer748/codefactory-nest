import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike, In, IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Role, UserModel } from './entity/user.entity';
import { ProfileModel } from './entity/profile.entity';
import { PostModel } from './entity/post.entity';
import { TagModel } from './entity/tag.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Post('sample')
  async sample() {
    //* 모델에 해당되는 객체 생성 - DB에 저장 X
    // const user1 = this.userRepository.create({
    //   email: 'test@codefactory.ai'
    // });
    // // 리턴시 생성한 객체는 반환 함
    // return user1;

    //* 생성된 객체를 DB에 저장
    // const user2 = this.userRepository.save({
    //   email: 'test@codefactory.ai'
    // });
    // // DB에 넣은 데이터를 리턴하기 떄문에 모든 값을 가지고 있다.
    // return user2;

    /**
     * preload
     * 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
     * 추가 입력된 값으로 DB에서 가져온 값들을 대체한다.
     * 바뀐 데이터를 저장하지는 않음
     */
    // const user3 = await this.userRepository.preload({
    //   id: 101,
    //   email: 'codefactory@codefactory.ai'
    // });
    //
    // // 실제 DB에 있는 값이아닌 대체한 값이 리턴된다. - DB에 데이터는 그대로
    // return user3;

    //* 삭제하기
    // await this.userRepository.delete(101);
    // return true;

    /**
     * increment
     * { 조건 }에 해당하는 row의 특정컬럼 값을 원하는 만큼 증가 시킨다.
     * 예제의 경우 id가 1인 데이터의 count컬럼에 값을 2 증가 시킴
     */
    // await this.userRepository.increment({
    //   id: 1,
    // }, 'count', 2);

    /**
     * decrement
     * { 조건 }에 해당하는 row의 특정컬럼 값을 원하는 만큼 감소 시킨다.
     * 예제의 경우 id가 1인 데이터의 count컬럼에 값을 1 감소 시킴
     */
    // await this.userRepository.decrement({
    //   id: 1,
    // }, 'count', 1);

    //* 갯수 카운팅
    // const count = await this.userRepository.count({
    //   where: {
    //     email: Like('%0%'),
    //   }
    // });
    //
    // return count;

    //* sum
    //? 예제 조건 - 이메일에 0이들어가는 모든 데이터의 count를 더한 값
    // const sum = await this.userRepository.sum('count', {
    //   email: Like('%0%')
    // });
    // return sum;

    //* average
    //? 예제 조건 - 이메일에 0이들어가는 모든 데이터의 count의 평균 값
    // const avg = await this.userRepository.average('count', {
    //     email: Like('%0%')
    //   });
    // return avg;

    //* 최소값
    // return await this.userRepository.minimum('count', {
    //   id: LessThan(10)
    // });

    //* 최대값
    // return await this.userRepository.maximum('count', {
    //   id: LessThan(10)
    // });

    //* 전체 조회
    // return await this.userRepository.find({});

    //* 단일 조회
    // return await this.userRepository.findOne({
    //   where: {
    //     id: 3
    //   }
    // });

    //* 데이터 조회 + 총 데이터 갯수
    const usersAndCount = await this.userRepository.findAndCount({
      take: 3
    });
    return usersAndCount;
  }

  @Post('users')
  async postUser() {
    for (let i = 0; i < 100; i++) {
      await this.userRepository.save({
        email: `user-${i}@google.com`,
      })
    }
    return true;
  }

  @Get('users')
  getUsers() {
    return this.userRepository.find({
      /**
       * where 심화
       *
       * Not(): ()가 아닌 경우의 데이터 가져오기
       * LessThan(): () 보다 작은 경우 가져오기
       * LessThanOrEqual(): () 보다 작거나 같은 경우 가져오기
       * MoreThan(): () 보다 큰 경우 가져오기
       * MoreThanOrEqual(): () 보다 크거나 같은 경우 가져오기
       * Equal(): ()와 같은 데이터 가져오기
       * Like(): (% %)유사값 가져오기
       *      - %의 위치에 따라 앞뒤로 어떤값이 있든 상관없이~ 같은 느낌의 조건이 걸린다.
       * ILike(): 대소문자 구분없이 LIKE 조건 사용
       * Between(10, 15): 첫번쨰 인자 ~ 두번쨰 인자 사잇값
       * In([]): 리스트 내에 해당하는 값들
       * isNull(): 해당 프로퍼티가 null인 값듦
       */
      // where: {
      //   id: Not(In([30, 31]))
      // }

      /**
       * select:
       * 어떤 프로퍼티를 가져올지 선택
       * 정의하지 않을시 모든 프로퍼티를 가져온다.
       *
       * 만약 관계 옵션에 eager: true인 프로퍼티는 select 관계없이 가져온다.
       *
       * relations에 정의한 죠인테이블의 select도 지정할 수 있다.
       */
      // select: {
      //   id: true,
      //   createdAt: true,
      //   updatedAt: true,
      //   version: true,
      //   profile: {
      //     id: true
      //   }
      // },
      //* 필터링할 조건을 입력 - 객체 하나에서 늘어나는 조건은 AND 조건으로 붙는다.
      // where: [
      //   //* 객체하나가 조건하나 {} Or {}
      //   {
      //     id: 4
      //   },
      //   {
      //     version: 1
      //   }
      // ],
      //* 죠인한 테이블로 조건을 걸 수도 있다.
      // where: {
      //   // profile: {
      //   //   id: 4
      //   // }
      // },
      //* 관계 가져오기
      // relations: {
      //   profile: true,
      //   posts: true
      // },
      //* 데이터 정렬
      order: {
        id: 'ASC'
      },
      // //* 처음 몇개를 제외할지(offset?)
      // skip: 0,
      // //* 가져올 데이터의 갯수
      // take: 2
    });
  }

  @Patch('users/:id')
  async patchUser(
    @Param('id') id: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: +id }
    });

    return this.userRepository.save({
      ...user,
      email: user.email + '0',
    })
  }

  @Delete('user/profile/:id')
  async deleteProfile(
    @Param('id') id: string,
  ) {
    await this.profileRepository.delete(+id);
  }

  @Delete('user/:id')
  async deleteUser(
    @Param('id') id: string,
  ) {
    await this.userRepository.delete(+id);
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'abc@gmail.com',
      profile: {
        profileImg: '/uploads/user/user.jpg',
      }
    });

    //* user - nullable: false로 설정시 에러
    // await this.profileRepository.save({
    //   profileImg: '/uploads/user/user.jpg',
    // });

    return user;
  }

  @Post('user/post')
  async createUserAndPosts() {
    const user = await this.userRepository.save({
      email: 'postuser@gmail.com',
    });

    await this.postRepository.save({
      title: 'post 1',
      author: user,
    });

    await this.postRepository.save({
      title: 'post 2',
      author: user,
    });

    return user;
  }

  @Post('posts/tags')
  async createPostsTags() {
    const post1 = await this.postRepository.save({
      title: 'NestJS Lecture',
    });

    const post2 = await this.postRepository.save({
      title: 'Programming Lecture',
    });

    const tag1 = await this.tagRepository.save({
      name: 'Javascript',
      posts: [post1, post2],
    });

    const tag2 = await this.tagRepository.save({
      name: 'Typescript',
      posts: [post1],
    });

    //* 역으로 포스트 생성시 태그를 참조해도 문제없음
    const post3 = await this.postRepository.save({
      title: 'NextJS Lecture',
      tags: [tag1, tag2],
    });

    return true;
  }

  @Get('posts')
  getPosts() {
    return this.postRepository.find({
      relations: {
        tags: true
      }
    })
  }

  @Get('tags')
  getTags() {
    return this.tagRepository.find({
      relations: ['posts']
    })
  }
}
