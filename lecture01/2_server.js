/**
 * Express를 이용한 서버 세팅
 * 1. (npm, yarn) init를 사용해 프로젝트 초기 세팅 -> package.json 생성
 * 2. express를 패키지 내에 설치
 * 3. 코드 작성
 */
const express = require('express');

//* 앱을 생성(익스프레스를 실행) - 서버를 생성한 것.
const app = express();

//* 엔드포인트를 붙여나갈 수 있다.
app.get('/', (req, res) => {
    res.send('<h1>Home Page!</h1>')
});
// app.post();
// app.delete();
// app.put();

app.get('/post', (req, res) => {
    res.send('<h1>Post Page!</h1>')
});

app.get('/user', (req, res) => {
    res.send('<h1>User Page!</h1>')
});

//* use? 미들웨어에서 사용
app.use((req, res) => {
    res.status(404).send('<h1>Oops! 404 Not Found Page!</h1>');
});

//* 서버를 실행 - 인자 = (포트, 실행시킬 함수)
app.listen(3000, () => console.log('Server started on port 3000'));
