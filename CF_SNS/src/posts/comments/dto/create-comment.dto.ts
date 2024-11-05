import { IsNotEmpty, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comments.entity';

export class CreateCommentDto extends PickType(CommentsModel, ['comment']){
}