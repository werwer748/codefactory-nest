import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserModel } from './user.entity';
import { TagModel } from './tag.entity';

@Entity()
export class PostModel {
  @PrimaryGeneratedColumn()
  id: number;

  //* N:1의 관계쪽이 자동으로 주인테이블이 되기떄문에 @JoinColumn이 필요없음
  @ManyToOne(() => UserModel, (user) => user.posts)
  author: UserModel;

  @ManyToMany(() => TagModel, (tag) => tag.posts)
  //* 두엔티티중 한군데에는 중간테이블이 있음을 선언해줘야함
  @JoinTable()
  tags: TagModel[];

  @Column()
  title: string;
}