import { Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { UsersModel } from '../../users/entity/users.entity';
import { MessagesModel } from '../messages/entities/messages.entity';

@Entity()
export class ChatsModel extends BaseModel {
  /**
   * @ManyToMany(): 다대다 관계를 맵핑
   * 다대다 애노테이션이 선언된 두 컬럼중 한 컬럼에는 @JoinTable()이 필요하다.
   */
  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[];

  @OneToMany(() => MessagesModel, (message) => message.chat)
  messages: MessagesModel[];
}