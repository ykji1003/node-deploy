const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    // req.session 객체에 어떤 데이터를 저장할 지 선택,
    // 사용자 정보를 다 들고 있으면 메모리를 많이 차지하므로 사용자 아이디만 저장
    passport.serializeUser((user, done) => {
       done(null, user.id);
    });

    // req.session에 저장된사용자 아이디를 바탕으로 DB 조회로 사용자 정보를 얻어내 req.user에 저장
    passport.deserializeUser((id, done) => {
       User.findOne({
           where : {id},
           include : [{
               model : User,
               attributes : ['id', 'nick'],
               as : 'Followers',
           }, {
               model : User,
               attributes : ['id', 'nick'],
               as : 'Followings',
           }],
       })
           .then(user => done(null, user))
           .catch(err => done(err));
    });

    local();
    kakao();
}
