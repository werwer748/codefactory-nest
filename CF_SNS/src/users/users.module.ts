import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersModel
    ])
  ],
  //* 이 모듈을 사용하는 곳에서 프로바이더를 사용할 수 있게끔 등록해줘야 함.
  exports: [UsersService],
  controllers: [UsersController],
  //* 이 안에 명시된 값들은 이 묘듈 안에서만 쓸 수 있다.
  providers: [UsersService],
})
export class UsersModule {}
