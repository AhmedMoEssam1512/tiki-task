const express = require('express');
const router = express.Router();
const projectController = require('../controler/project_controller');
const projectMiddleware = require('../middleware/project_middleware');
const { protect } = require('../middleware/auth');


router.route('/get_all_projects')
    .get(protect, projectController.getAllProjects);

router.route('/:id')
    .get(protect, projectMiddleware.projectExist, projectMiddleware.isMember, projectController.getProjectById);

module.exports = router;