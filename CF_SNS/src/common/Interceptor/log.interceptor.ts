import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

// rxjs: 스트림! - nestjs에 자동으로 설치가 되어있음
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {

  // override
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    /**
     * 요청이 들어올 때 요청이 들어온 타임스탬프를 찍는다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 응답이 나갈 때 다시 타임스템프를 찍는다.
     * [RES] {요청 path} {응답 시간} {요청~응답까지 소요시간(ms)}
     */
    // === 요청 엔드포인트 로직 시작전 실행되는 로직 === //
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // /post/...
    const path = req.originalUrl;

    const now = new Date();

    // 요청 정보 남기기
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);
    // === 요청 엔드포인트 로직 시작전 실행되는 로직 === //



    //Observable 반환하기 - 응답을 자유롭게 변형하거나 로그하거나 에러 캐치 등..
    return next
      // === 라우트의 로직이 전부 실행되고 응답이 반환 된다. (next.handle()을 실행한 순간)=== //
      .handle()
      // 원하는 rxjs의 모든 함수를 무한하게 넣을 수 있고 이 함수는 순서대로 실행 된다.
      .pipe(
        /**
         * rxjs의 가장 기본적인 사용법
         *
         * tap: 함수를 실행할 수 있다.
         * tap((observable) => console.log(observable)),
         * map: 전달받은 응답값을 변형할 수 있다.
         * map((observable) => {
         *   return {
         *     success: 'ok',
         *     message: '응답이 변경 돼었습니다.',
         *     res: observable,
         *   }
         * })
         */
        // 원래 의도대로 응답 기록만 남기기 //
        tap((observable) => {
          const endTime = new Date();
          const elapsedTime = endTime.getTime() - now.getTime();
          // res에서 가져오는 값은 요청이 종료되는 handel()함수 이후에 확인이 가능하다.
          const statusCode = res.statusCode; // 응답코드

          // console.log(`[RES] ${path} ${endTime.toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}`);
          console.log(`[RES] [status]: ${statusCode} ${path} ${endTime.toLocaleString('kr')} [ms]:${elapsedTime}`);
        })
      )
  }
}