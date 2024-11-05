import { BadRequestException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(
    private readonly postService: PostsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('Post ID 는 필수입니다.');
    }

    const exists = await this.postService.checkPostExistsById(
      parseInt(postId)
    );

    if (!exists) {
      throw new NotFoundException('Post가 없다');
    }

    next();
  }
}