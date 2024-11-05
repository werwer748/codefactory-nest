//* 추상화 시켜서 직접 생성해서 사용하지 못하도록..
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  //* 데이터가 변경될 떄마다 업데이트 날짜가 최신화 된다.
  @UpdateDateColumn()
  updatedAt: Date;

  //* 데이터의 생성일을 기록한다.
  @CreateDateColumn()
  createdAt: Date;
}