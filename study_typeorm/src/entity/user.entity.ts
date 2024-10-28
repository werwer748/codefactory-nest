import {
  Column,
  CreateDateColumn,
  Entity, Generated, OneToMany, OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ProfileModel } from './profile.entity';
import { PostModel } from './post.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class UserModel {
  /**
   * Primary Column?
   * => 테이블 내 각 Row를 구분 할 수 있도록 해주는 컬럼
   * => 해당 컬럼은 모든 테이블에 기본적으로 존재해야 한다.
   * @PrimaryGeneratedColumn()
   * ? 자동으로 ID를 생성
   * => 숫자를 사용하면 1, 2, 3, ... 식으로 자동 증가
   * @PrimaryGeneratedColumn('uuid')
   * => 절대로 겹치치않는 특수한 문자열
   *
   * @PrimaryColumn()
   * ? 직접 컬럼값을 넣어줘야 한다.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // 제목
  // @Column({
  //   // DB에서 인지하는 컬럼 타입
  //   // 기본적으로 자동으로 유추 된다.
  //   type: 'varchar',
  //   // DB 컬럼 이름 - 프로퍼티 이름으로 자동 유추 됨
  //   name: 'title',
  //   // 값의 길이
  //   length: 300,
  //   // null 가능 여부
  //   nullable: true,
  //
  //   // update: false => 생성시에만 값을 넣을 수 있다.
  //   update: true,
  //
  //   // 속성 기본값은 true,
  //   // find 했을 때 기본으로 이 컬럼을 포함할 것인지
  //   select: false,
  //
  //   // 기본값? 생성시 기본으로 채워넣을 값
  //   default: 'default value',
  //
  //   // 컬럼중 유일한 값이어야 하는지
  //   unique: false,
  // })
  // title: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  /**
   * @CreateDateColumn()
   * => 데이터 생성일자가 자동으로 찍힌다.
   */
  // 데이터 생성 일자
  @CreateDateColumn()
  createdAt: Date;

  /**
   * @UpdateDateColumn()
   * => 데이터 업데이트 일자가 자동으로 찍힌다.
   */
  // 데이터 업데이트 일자
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * @VersionColumn()
   * => 데이터가 업데이트 될 때마다 1씩 올라간다.
   *    생성시 기본값은 1
   *    정확히는 save() 함수가 몇번 불렸는지 기억하는 것.
   */
  @VersionColumn()
  version: number;

  /**
   * @Column()
   * @Generated()
   * 함께 선언하여 사용하면 자동으로 값이 차는 컬럼을 만들 수 있다.
   *
   * @Generated('increment')
   *  => 로우마다 1씩 올라가는 컬럼
   *
   *  @Generated('uuid')
   *  => 로우마다 겹치지않는 특수한 문자열로 채워지는 컬럼
   */
  @Column()
  @Generated('uuid')
  additionalId: string;

  /**
   * 모든 관계 데코레이터는 똑같은 옵션을 제공한다.
   * @관계데코레이터(함수, 함수, 옵션)
   */
  @OneToOne(() => ProfileModel, (profile) => profile.user, {
    //? find() 실행시 항상 함께 데이터를 가져올 것인지 - default: false
    eager: false,
    //? 저장할 때 relation을 한번에 같이 저장할 것인지 - default: false
    cascade: true,
    //? null이 가능한지 - 실제 컬럼이 없어서 에러 확인은 안됨 - default: true
    nullable: true,
    /**
     * 관계가 삭제됐을때
     * no action -> 아무것도 안함
     * cascade -> 참조하는 Row도 같이 삭제
     * set null -> 참조하는 Row에서 참조 id를 null로 변경
     * set default -> 기본 세팅으로 설정(테이블의 기본 세팅)
     * restrict -> 참조하고 있는 Row가 있는 경우 참조 당하는 Row 삭제 불가
     */
    onDelete: 'SET NULL'
  })
  profile: ProfileModel;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @Column({
    default: 0
  })
  count: number;
}