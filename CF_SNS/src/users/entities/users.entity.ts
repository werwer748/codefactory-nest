import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';
import { BaseModel } from '../../common/entities/base.entity';
import { IsEmail, IsString, Length, ValidationArguments } from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';

@Entity()
export class UsersModel extends BaseModel {

  @IsString({
    message: stringValidationMessage
  })
  @Length(1, 20, {
    message: lengthValidationMessage
  })
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  @IsString({
    message: stringValidationMessage
  })
  @IsEmail({}, {
    message: emailValidationMessage
  })
  @Column({
    unique: true,
  })
  email: string;

  @IsString({
    message: stringValidationMessage
  })
  @Length(3, 8, {
    message: lengthValidationMessage
  })
  @Column()
  password: string;

  @Column({
    type: 'enum',
    // enum: Object.values(RolesEnum), - 이런식으로 써도 된다.
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[]
}