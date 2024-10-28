import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';

export class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 1) 상속받은 클래스가 각각 테이블을 생성
@Entity()
export class BookModel extends BaseModel {
  //? BaseModel 프로퍼티 + name: string
  @Column()
  name: string;
}

@Entity()
export class CarModel extends BaseModel {
  //? BaseModel 프로퍼티 + brand: string
  @Column()
  brand: string;
}


// 2) 하나의 테이블로 생성하여 사용하기 - 단일 테이블 상속
//* 테이블 하나로 다수의 엔티티를 관리하는 것.
@Entity() //* 기존 BaseModel과 달리 엔티티로 등록한다.
@TableInheritance({
  column: { // 해당 엔티티를 상속받은 엔티티중 어느것인지 구분이 필요함
    name: 'type',
    type: 'varchar',
  }
})
export class SingleBaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * 아래 두 클래스 모두 SingleBaseModel 을 상속받아
 * 프로퍼티가 합쳐지는것은 맞다.
 *
 * @ChildEntity를 선언해 준다.
 */
@ChildEntity()
export class ComputerModel extends SingleBaseModel {
  @Column()
  brand: string;
}

@ChildEntity()
export class AirplaneModel extends SingleBaseModel {
  @Column()
  country: string;
}