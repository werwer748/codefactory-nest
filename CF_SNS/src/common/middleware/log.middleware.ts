import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  // 실무에서는 nest morgan을 사용할 것을 추천. 지금 방식은 미들웨어 연결 예시를 위한 방법임
  private logger = new Logger('HTTP'); // 'HTTP'는 context로 사용된다. context는 로그를 구분할 때 사용된다.

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}}`,
      );
    });
    next();
  }

}