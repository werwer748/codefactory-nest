import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UsersModel } from '../../users/entity/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { ImageModel } from '../../common/entity/image.entity';
import { CommentsModel } from '../comments/entity/comments.entity';

/**
 * @Entity?
 *
 * 해당 데코레이터를 사용한 클래스의 이름을 기반으로 테이블을 생성함.
 * 클래스가 테이블로 변환이 된다.
 *
 * 테이블 내에 컬럼이 클래스 내의 프로퍼티로 이루어지도록 해야한다.
 * => @Column
 *
 * PrimaryKey 컬럼이 필요함
 * => @PrimaryGeneratedColumn
 */
@Entity()
export class PostsModel extends BaseModel {
  // 1. Foreign Key를 이용해 UsersModel과 연동
  // 2. null이 될 수 없다.
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: stringValidationMessage
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage
  })
  content: string;

  @Column({
    nullable: true
  })

  @Column({
    default: 0
  })
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany((type) => ImageModel, (image) => image.post)
  images: ImageModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];
}