//* http 모듈을 사용해 REST API 서버를 구성하는 가장 기본적인 방법
//* 이대로 사용하면 프로젝트가 커지고 각종 기능을 적용함에 있어 굉장히 제한이 많다.

//* node에서 제공하는 기본 모듈
const http = require('http');
//? 요청 주소를 파싱하기 위해 사용
const url = require('url');

//* localhost -> 127.0.0.1 -> loop back -> 서버를 실행한 컴퓨터
const host = 'localhost';
const port = 3000;

/**
 * 서버 생성
 * req(request): 요청
 * res(response): 응답
 */
const server = http.createServer((req, res) => {
    //? 호스트:포트를 제외한 나머지 url 정보 가져오기
    const path = url.parse(req.url).pathname;

    /**
     * 응답 헤더 생성
     * res.writeHead(응답 코드, 응답 컨텐츠 타입);
     *
     * 응답 보내기
     * res.end(응답 내용);
     */

    //* 엔드포인트를 if문으로 분기처리
    if (path === '/') {
        res.writeHead(200, {'Content-Type': 'text/html' });
        res.end('<h1>Home Page!</h1>');
    } else if (path === '/post') {
        res.writeHead(200, {'Content-Type': 'text/html' });
        res.end('<h1>Post Page!</h1>');
    } else if (path === '/user') {
        res.writeHead(200, {'Content-Type': 'text/html' });
        res.end('<h1>User Page!</h1>');
    } else {
        res.writeHead(404, {'Content-Type': 'text/html' });
        res.end('<h1>Oops! 404 Not Found Page!</h1>');
    }
});

//* 서버를 실행 - 인자 = (포트, 호스트, 실행시 바로실행시킬 함수)
server.listen(port, host, () => {
    console.log(`server running on http://${host}:${port}`);
});