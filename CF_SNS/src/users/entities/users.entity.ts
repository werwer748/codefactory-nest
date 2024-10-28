import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  // 1. 길이가 20을 넘지 않을 것
  // 2. 유일무이한 값이 될 것 (nickname은 중복 불가)
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  // 1. 유일무이한 값
  @Column({
    unique: true,
  })
  email: string;

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