import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserModel } from './user.entity';

@Entity()
export class ProfileModel {
  @PrimaryGeneratedColumn()
  id: number;

  //? 어차피 유저에 묶여있는 테이블이니 해당 컬럼을 프라이머리키로 사용해도 됨
  //* UserModel과 연결 user 프로퍼티는 user.profile과 연결된다.
  @OneToOne(() => UserModel, (user) => user.profile, {
    // nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn() //* 외래키는 JoinColumn이 선언된 엔티티에서 관리하게 한다.(관계의 주인으로 설정)
  user: UserModel;

  @Column()
  profileImg: string;
}