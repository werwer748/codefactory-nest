import { Injectable, NotFoundException } from '@nestjs/common';

//* export 해줌으로써 이 클래스를 사용하는쪽에서도 타입을 인식할 수 있음
export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

// 포스트 더미데이터
let posts: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스님 민지',
    content: '디제잉하는 뉴진 스님',
    likeCount: 1000000,
    commentCount: 999999,
  },
  {
    id: 2,
    author: 'newjeans_official',
    title: '뉴진스님 해린',
    content: '노래 연습중~',
    likeCount: 1000000,
    commentCount: 999999,
  },
  {
    id: 3,
    author: 'blackpink_official',
    title: '블랙핑크 로제',
    content: '아파트 아파트?',
    likeCount: 1000000,
    commentCount: 999999,
  },
];

@Injectable()
export class PostsService {
  getAllPosts() {
    return posts;
  }

  getPostById(postId: number) {
    const post = posts.find((post) => post.id === postId);

    //* 데이터를 못찾으면 에러를 반환해주기
    if (!post) {
      //? NotFoundException => nest에서 제공해주는 기본 에러 타입
      throw new NotFoundException();
    }

    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post = {
      id: posts.at(-1).id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts = [
      ...posts,
      post,
    ];

    return post;
  }

  updatePost(postId: number, author: string, title: string, content: string) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    posts = posts.map(prevPost => prevPost.id === postId ? post : prevPost);

    return post;
  }

  deletePost(postId: number) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }

    posts = posts.filter((post) => post.id !== postId);

    return postId;
  }
}
