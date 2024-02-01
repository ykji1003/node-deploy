const express = require('express');
const {isLoggedIn, isNotLoggedIn} = require('../middlewares');
const { renderProfile, renderJoin, renderMain, renderHashtag } = require('../controller/page');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie : true});

const router = express.Router();

router.use((req, res, next) => {
   res.locals.user = req.user;
   res.locals.followercount = req.user ? req.user.Followers.length : 0;
   res.locals.followingCount = req.user ? req.user.Followings.length : 0;
   res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
   next();
});

router.get('/profile', isLoggedIn, renderProfile);
router.get('/join', isNotLoggedIn, renderJoin);
router.get('/hashtag', isNotLoggedIn, renderHashtag);
router.get('/', csrfProtection, renderMain);           // csurf 처리

module.exports = router;