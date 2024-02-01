const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const redis = require('redis');
const RedisStore = require('connect-redis').default;

dotenv.config();
const redisClient = redis.createClient({
    url : `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password : process.env.REDIS_PASSWORD,
    legacyMode : false,

});
redisClient.connect().catch(console.error);

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const {sequelize} = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');

const app = express();
passportConfig();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure(path.join(__dirname, 'views'), {
    express : app,
    watch : true,
});

sequelize.sync({ force : false})
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
       console.error(err);
    });

const sessionOption = {
    resave : false,
    saveUninitialized : false,
    secret : process.env.COOKIE_SECRET,
    cookie: {
        httpOnly : true,
        secure : false,  // https여부
    },
    // store의 기본값은 메모리이므로 레디스에 저장하는 것으로 변경 처리
    store : new RedisStore({ client : redisClient}),
};

if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');   // proxy서버를 사용하면 넣어두면 좋다
    sessionOption.proxy = true,
    app.use(helmet({
        contentSecurityPolicy : false,
        crossOriginEmbedderPolicy : false,
        crossOriginResourcePolicy : false,
    }));
    app.use(hpp());
    app.use(morgan('combind'));
} else {
    app.use(morgan('dev'));
}


app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
   error.status = 404;
   logger.info('hello');
   logger.error(error.message);
   next(error);
});

app.use((err,req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
