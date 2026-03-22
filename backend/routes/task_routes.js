const express = require("express");
const router = express.Router();
const taskController = require("../controler/tasks_controller");
const taskMiddleware = require("../middleware/task_middleware");
const projectMiddleware = require("../middleware/project_middleware");
const { protect} = require("../middleware/auth");

router.route("/create_task")
    .post(protect,taskMiddleware.validateCreateTask,taskMiddleware.validateTime,taskController.createTask);

router.route("/get_all_tasks/:id")
    .get(protect,projectMiddleware.projectExist,projectMiddleware.isMember,taskController.getAllTasksByProjectId);

router.route("/get_my_tasks")
    .get(protect,taskController.getAllTasksByUser);

router.route("/assign_task/:id/:user_id")
    .patch(protect,taskMiddleware.taskExist,taskMiddleware.canViewTask,taskMiddleware.ownerOfTask,taskMiddleware.validateAssignedUser,taskController.assignTask);

router.route("/mark_as_done/:id")
    .patch(protect,taskMiddleware.taskExist,taskMiddleware.canViewTask,taskMiddleware.canEditTask,taskController.markAsDone);

router.route("/:id")
    .get(protect,taskMiddleware.taskExist,taskMiddleware.canViewTask,taskController.getTaskById)
    .patch(protect,taskMiddleware.taskExist,taskMiddleware.canViewTask,taskMiddleware.ownerOfTask,taskMiddleware.validateTime,taskController.updateTask)
    .delete(protect,taskMiddleware.taskExist,taskMiddleware.canViewTask,taskMiddleware.ownerOfTask,taskController.deleteTask);


module.exports = router;
