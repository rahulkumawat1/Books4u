const express = require('express');
const shopControllers = require('../controllers/shop');

const router = express.Router();

router.get('/signup', shopControllers.getSignUp);
router.post('/signup', shopControllers.postSignUp);

router.get('/login', shopControllers.getLogin);
router.post('/login', shopControllers.postLogin);

router.get('/logout', shopControllers.logout);

// router.post('/otp-varification', shopControllers.postOTPverfication);

// router.get('/reset', shopControllers.getReset);
// router.post('/reset', shopControllers.postReset);

router.get('/reset/:token', shopControllers.getResetTokenValidate);
router.post('/new-password', shopControllers.postNewPassword);

router.get('/product/:productId', shopControllers.detailProduct);

router.post('/search', shopControllers.getSearch);

router.get('/', shopControllers.showProducts);


module.exports = router;