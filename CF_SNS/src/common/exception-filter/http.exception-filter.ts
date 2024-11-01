import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

/**
 * @Catch()
 * ExceptionFilter 구현을 위해 해당 데코레이터를 달아줘야 한다.
 * 첫번째 인자로 잡고싶은 exception을 넣어주면 된다.
 *    => nest에서 제공해주는 기본 exception들은 HttpException을 확장해준다.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // 자동완성시 => catch(exception: any, host: ArgumentsHost): any
  // => exception의 타입을 Catch에 첫번쨰 인자로 넘긴 exception을 넣어준다. - 에러캐칭을 위해
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = exception.getStatus();

    /**
     * 여기서 에러 로그를 파일을 생성한다거나
     * 에러 모니터링 시스템에 API 콜하기 등을 넣으면 유용하다.
     *
     * 그럴 경우 main.ts에 useGlobalFilter에 적용해서 사용하면 좋다.
     */

    //* 실제 응답값을 변경할 수 있따.
    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        timestamp: new Date().toLocaleString('kr'),
        path: request.url,
      })
  }
}