import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, finalize, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  //* 인터셉터도 Injectalble이 붙은 프로바이더기 때문에 원하는 인스턴스를 주입받을 수 있다.
  constructor(
    private readonly dataSource: DataSource
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    // 쿼리러너 생성 - 트랜잭션과 관련된 모든 쿼리를 담당
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결
    await qr.connect();
    // 쿼리 러너에서 트랜잭션 시작 - 이 시점부터 쿼리러너를 사용하면 트랜잭션 안에서 DB 액션을 실행
    await qr.startTransaction();

    req.queryRunner = qr;

    return next
      .handle()
      .pipe(
        // rxjs에서 제공하는 에러를 받을 수 있는 함수
        catchError(async (e) => {
          await qr.rollbackTransaction();
          await qr.release();

          throw new InternalServerErrorException(e.message);
        }),
        tap(async () => {
          await qr.commitTransaction();
          await qr.release();
        }),
        // 파이프 내 함수들의 실행 성공과 실패에 상관없이 실행되는 함수!
        finalize(() => console.log('무조건 실행되는지 테스트!!'))
      );
  }

}