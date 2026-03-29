const express = require('express');
const router = express.Router();
const loginController = require('../controller/login_controller');
const loginMiddleware = require('../middleware/login_middleware');
const authMiddleware = require('../middleware/auth');

router.route('/sign_up')
    .post(loginMiddleware.checkData,loginMiddleware.validateEmail,
        loginMiddleware.encryptPassword,loginMiddleware.userExists,
        loginController.signup);

router.route('/')
        .post(loginController.login);

router.route('/me')
        .get(authMiddleware.protect,loginController.me);

router.route('/forget_password/:email')
        .post(loginController.forgetPassword);

router.route('/otp')
        .patch(loginController.verifyOTP);

router.route('/reset_password')
        .patch(loginController.resetPassword);

router.route('/change_password')
        .patch(authMiddleware.protect,loginController.changePassword);

module.exports = router;