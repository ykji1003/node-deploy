const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie : true});

const { afterUploadImage, uploadPost } = require('../controller/post');
const { isLoggedIn } = require('../middlewares');

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage : multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            console.log("ext : " + ext);
            console.log("file.originalname : " + ext);
            console.log("path.basename(file.originalname, ext) : " + path.basename(file.originalname, ext));
            cb(null, path.basename(file.originalname, ext)+ Date.now() + ext);
        },
    }),
    limits : { fileSize : 5 * 1024 * 1024 },
});

// POST : /post/img
router.post('/img', isLoggedIn, upload.single('img'), afterUploadImage);

// form의 enctype이 multipart/form-data 일경우 빈 multer를 전달해줘야 submit이 정상처리된다.
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), csrfProtection, uploadPost); // csurf 처리

module.exports = router;