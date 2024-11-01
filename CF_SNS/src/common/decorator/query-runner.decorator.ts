import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetQueryRunner =
  createParamDecorator((_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const queryRunner = req.queryRunner;

    if (!queryRunner) {
      throw new InternalServerErrorException('Not Found QueryRunner In Interceptor!');
    }

    return queryRunner;
  })