import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
export class PostsModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}