import { UsersModel } from '../../../users/entity/users.entity';

export interface ICreateComment {
  author: UsersModel;
  postId: number;
  comment: string;
}