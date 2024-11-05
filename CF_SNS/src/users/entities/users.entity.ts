import {
  Column,
  CreateDateColumn,
  Entity, JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';
import { BaseModel } from '../../common/entities/base.entity';
import { IsEmail, IsString, Length, ValidationArguments } from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';
import { ChatsModel } from '../../chats/entities/chats.entity';
import { MessagesModel } from '../../chats/messages/entities/messages.entity';

@Entity()
// @Exclude() - 전체 숨김처리
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
  // @Expose() - 전체 숨김처리시 nickname만 노출
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

  // @Expose()
  // //* 테스트용 Getter
  // get nicknameAndEmail() {
  //   return this.nickname + '/' + this.email;
  // }

  @IsString({
    message: stringValidationMessage
  })
  @Length(3, 8, {
    message: lengthValidationMessage
  })
  /**
   * @Exclude()의 옵션
   * toClassOnly -> class instance로 변환될떄만
   * toPlainOnly -> plain object로 변환될떄만
   *
   * 요청을 전송(Request)
   * frontend -> backend 로 데이터 전송시
   * plain object(JSON) -> class instance (dto)
   *
   * 응답을 전송(Response)
   * backend -> frontend 로 데이터 전송시
   * class instance (dto) -> plain object(JSON)
   *
   * 비밀번호는 요청시에는 필요하고 응답에서는 필요가 없다.
   */
  @Exclude({
    // 응답에만 사용한다.
    toPlainOnly: true,
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
  posts: PostsModel[];

  /**
   * @JoinTable(): @ManyToMany의 경우 두 테이블간에 맵핑을 해주는 중간 테이블이 필요함.
   * => 총 3개의 테이블이 필요한 것.
   */
  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel[];
}