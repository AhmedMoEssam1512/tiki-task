const express = require('express');
const router = express.Router();
const userController = require('../controler/user_controller');
const user_middleware = require('../middleware/user_middleware');
const {protect} = require('../middleware/auth');

router.route('/edit_profile')
    .patch(protect, user_middleware.userFound, user_middleware.checkDuplicate, userController.editProfile);

router.route('/create_project')
    .post(protect, user_middleware.userFound, userController.createProject);

module.exports = router;