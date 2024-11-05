//* 데코레이터는 대문자로 시작하는것이 관례이다.
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { UsersModel } from '../entity/users.entity';

export const User =
  createParamDecorator((data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    //! 무조건 AccessTokenGuard를 사용한 상태에서만 사용한다는 가정하에 만들었기 때문에
    //! 코드 작성하다 실수했거나 무언가 잘못설계했으므로 서버에러를 던진다.
    if (!user) {
      throw new InternalServerErrorException('Request에 user 프로퍼티가 존재하지 않습니다.');
    }

    //* data === undefined ? user정보 통쨰로 : 지정한 user 프로퍼티
    if (data) {
      return user[data];
    }

    return user;
  });