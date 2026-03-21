const express = require('express');
const router = express.Router();
const loginController = require('../controler/login_controller');
const loginMiddleware = require('../middleware/login_middleware');

router.route('/sign_up')
    .post(loginMiddleware.checkData,loginMiddleware.validateEmail,
        loginMiddleware.encryptPassword,loginMiddleware.userExists,
        loginController.signup);

router.route('/')
        .post(loginController.login);

module.exports = router;