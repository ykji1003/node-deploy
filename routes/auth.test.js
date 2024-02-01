const app = require('../app');
const request = require('supertest');
const { sequelize } = require('../models');

// beforeAll : 모든 테스트가 수행되기 전에 실행
// 테스트가 수행되면 회원가입이 진행되므로 force : true속성을 통한 데이터베이스 초기화를 한다.
// 테스트 결과는 일관성이 있어야 한다.
beforeAll(async () => {
    await sequelize.sync({force : true});
})

// beforeEach : 테스트가 수행되기 전 반복적으로 실행된다.
beforeEach(() => {});

// reuqest(app).post(주소)로 요청
// send로 data를 전송
describe('POST /login', () => {

    test('로그인 안 했으면 가입', (done) => {
        request(app).post('/auth/join')
            .send({
                email : 'ykji1003@hotmail.co.kr',
                nick : '김재익',
                password : 'cpfl1318',
            })
            .expect('Location','/')
            .expect(302, done);
    })

    test('회원가입이 되어 있는데 또 가입하는 경우', (done) => {
        request(app).post('/auth/join')
            .send({
                email : 'ykji1003@hotmail.co.kr',
                nick : '김재익',
                password : 'cpfl1318',
            })
            .expect('Location','/join?error=exist')
            .expect(302, done);
    });

    test('로그인 수행', (done) => {
       request(app).post('/auth/login')
           .send({
               email : 'ykji1003@hotmail.co.kr',
               password : 'cpfl1318',
           })
           .expect('Location', '/')
           // Promise가 아닐 경우 done을 넣어줘야 jset가 해당 테스트가 끝난지 인식할 수 있다.
           .expect(302, done);
    });

    test('가입되지 않은 회원인 경우.', (done) => {
        const message = encodeURIComponent('가입되지 않은 회원입니다.');
        request(app).post('/auth/login')
            .send({
                email : 'ykji1002@hotmail.co.kr',
                password : 'cpfl1318',
            })
            // 테스트 결과는 send 후 결과가 expect와 일치해야 정상적으로 통과된다.
            .expect('Location', `/?loginError=${message}`)
            .expect(302, done);
    });

    test('비밀번호가 틀린 회원의 경우', (done) => {
        const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
        request(app).post('/auth/login')
            .send({
                email : 'ykji1003@hotmail.co.kr',
                password : 'cpfl13181',
            })
            .expect('Location', `/?loginError=${message}`)
            .expect(302, done);
    });
});

describe('POST /join', () => {

    // request(app)를 함께 사용하여 로그인 된 상태를 유지한다.
    const agent = request.agent(app);

    beforeEach((done) => {
        agent.post('/auth/login')
            .send({
                email : 'ykji1003@hotmail.co.kr',
                password : 'cpfl1318',
            // 실행이 끝남을 알리기 위함
            }).end(done);
    });
    test('로그인이 되어 있으면 회원가입 진행이 안되어야 한다.', (done) => {
        const message = encodeURIComponent('로그인한 상태입니다.');

        agent.post('/auth/join')
            .send({
                email : 'ykji1003@hotmail.co.kr',
                nick : '김재익',
                password : 'cpfl1318',
            })
            .expect('Location',`/?error=${message}`)
            .expect(302, done);
    });
});

describe('POST /logout', () => {
    test('로그인이 되어 있지 않으면 403', (done) => {
        request(app)
            .get('/auth/logout')
            .expect(403, done);
    });

    // beforeEach가 테스트가 수행될 때 항상 실행되지만
    // agent를 독립적으로 사용하기 때문에 다른 request(app) 에이전트에 영향이 없다.
    const agent = request.agent(app);
    beforeEach((done) => {
       agent
           .post('/auth/login')
           .send({
               email : 'ykji1003@hotmail.co.kr',
               password : 'cpfl1318',
           }).end(done);
    });
    test('로그아웃 수행', (done) => {
       agent
           .get('/auth/logout')
           .expect('Location', '/')
           .expect(302, done);
    });

});
// afterAll : 모든 테스트가 수행 끝난 후 실행
afterAll(() => {});

// afterEach : 테스트가 수행 끝난 후 반복적으로 실행된다.
beforeEach(() => {});