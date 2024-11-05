import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { CommonService } from '../../common/common.service';
import { ICreateComment } from './interfaces/create-comment.interface';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';
import { UpdateCommentDTO } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  async bulkCreateComments() {
    const comments: CommentsModel[] = [];

    for (let i = 0; i < 100; i++) {
      const comment = this.commentsRepository.create({
        comment: `${i}`,
        author: {
          id: 1
        },
        post: {
          id: 1
        }
      });

      comments.push(comment);
    }

    await this.commentsRepository.insert(comments);
  }

  paginateComments(dto: PaginateCommentsDto, postId: number) {
    const makeFindOptions: FindManyOptions<CommentsModel> = this.commonService.composeFindOptions(dto);
    makeFindOptions.where["post"] = { id: postId };

    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...makeFindOptions,
        ...DEFAULT_COMMENT_FIND_OPTIONS,
      },
      `posts/${postId}/comments`
    )
  }

  createComment(data: ICreateComment) {
    const {postId , ...rest} = data;
    const comment = this.commentsRepository.create({
      ...rest,
      post: {
        id: postId
      },
    });

    return this.commentsRepository.save(comment);
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id
      },
      ...DEFAULT_COMMENT_FIND_OPTIONS
    });

    if (!comment) {
      throw new NotFoundException(`${id} 이거 없다 임마`);
    }

    return comment;
  }

  async updateComment(
    dto: UpdateCommentDTO,
    commentId: number,
  ) {
    const comment = await this.commentsRepository.exists({
      where: {
        id: commentId,
      }
    });

    if (!comment) {
      throw new NotFoundException('없어 그거')
    }

    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentsRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(id: number) {
    const comment = await this.commentsRepository.exists({
      where: {
        id
      }
    });
    if (!comment) {
      throw new NotFoundException('없어 그거')
    }

    await this.commentsRepository.delete(id);

    return id;
  }
}
