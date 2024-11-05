import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { User } from '../../users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersModel } from '../../users/entity/users.entity';
import { UpdateCommentDTO } from './dto/update-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  getPostComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() dto: PaginateCommentsDto
  ){
    return this.commentsService.paginateComments(dto, postId);
    // await this.commentsService.bulkCreateComments();
    // return true;
  }

  @Get(':commentId')
  getComment(
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPostComment(
    @User() user: UsersModel,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto
  ) {
    return this.commentsService.createComment({
      comment: body.comment,
      author: user,
      postId
    })
  }

  @Patch(':commentId')
  @UseGuards(AccessTokenGuard)
  patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDTO
  ) {
    return this.commentsService.updateComment(
      body,
      commentId,
    )
  }

  @Delete(':commentId')
  @UseGuards(AccessTokenGuard)
  deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    return this.commentsService.deleteComment(commentId);
  }
}
