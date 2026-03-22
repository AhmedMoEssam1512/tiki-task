const express = require('express');
const router = express.Router();
const userController = require('../controller/user_controller');
const user_middleware = require('../middleware/user_middleware');
const {protect} = require('../middleware/auth');
const project_middleware = require('../middleware/project_middleware');

router.route('/edit_profile')
    .patch(protect, user_middleware.userFound, user_middleware.checkDuplicate, userController.editProfile);

router.route('/create_project')
    .post(protect, user_middleware.userFound, userController.createProject);

router.route('/enter_project/:id')
    .post(protect, user_middleware.userFound, project_middleware.projectExist,
        project_middleware.alreadyAssigned, userController.enterProjectUsingCode);

router.route('/delete_user')
    .delete(protect, userController.deleteUser);

router.route('/view_profile/:id')
    .get(userController.viewProfile);

module.exports = router;