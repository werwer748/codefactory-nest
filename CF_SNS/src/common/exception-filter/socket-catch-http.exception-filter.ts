import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';

//* BaseWsExceptionFilter를 상속해서 WebSocket 관련 exception을 만들 수 있다.
@Catch(HttpException) // 이것도 Exception이기 떄문에 Catch를 선언해야 한다.
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    //! 여기가 실행되면 부모 클래스의 catch가 그대로 실행되서 에러가 2개 나감
    // super.catch(exception, host);

    // http가 아닌 웹소켓 연결 정보 가져오기
    const socket = host.switchToWs().getClient();

    //* exception 이벤트로 데이터를 전달해준다.
    socket.emit(
      'exception',
      {
        data: exception.getResponse()
      }
    )
  }
}