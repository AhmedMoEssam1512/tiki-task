const {asyncwrapper}= require("../utils/asyncwrapper");
const logger = require("../config/logger");
const taskRepo= require ("../repo/task_repo")
const projectRepo = require("../repo/project_repo");
const assignedRepo = require("../repo/assigned_repo");
const userRepo = require("../repo/user_repo");
const AppError = require("../utils/AppError");

const validateCreateTask = asyncwrapper(async (req, res, next) => {
    const { name, description, due_date, project_id } = req.body;
    if (!name || !description || !due_date || !project_id) {
        logger.debug("All fields are required");
        const error = new AppError("All fields are required", 400);
        return next(error);
    }
    const project = await projectRepo.findById(project_id);
    if (!project) {
        logger.debug("Project not found");
        const error = new AppError("Project not found", 404);
        return next(error);
    }
    if (project.owner_id !== req.user.id) {
        logger.debug("You are not authorized to create task in this project");
        const error = new AppError("You are not authorized to create task in this project", 403);
        return next(error);
    }
    logger.debug("task can be created");
    next();
});

const validateTime = asyncwrapper(async (req, res, next) => {
    const project = await projectRepo.findById(req.task.project_id);
    const { due_date } = req.body||req.task;
    const deadline = new Date(due_date);
    if(deadline < Date.now()){
        logger.debug("Due date is in the past");
        const error = new AppError("Due date is in the past", 400);
        return next(error);
    }
    if(deadline > project.end_date){
        logger.debug("Due date is greater than project end date");
        const error = new AppError("Due date is greater than project end date", 400);
        return next(error);
    }
    if(deadline < project.start_date){
        logger.debug("Due date is less than project start date");
        const error = new AppError("Due date is less than project start date", 400);
        return next(error);
    }
    logger.debug("time is valid");
    req.body.due_date = deadline;
    next();
});

const taskExist = asyncwrapper(async (req, res, next) => {
    const task = await taskRepo.findById(req.params.id);
    if (!task) {
        logger.debug("Task not found");
        const error = new AppError("Task not found", 404);
        return next(error);
    }
    logger.debug(`Task found ${task.title}`);
    req.task = task;
    next();
});

const canViewTask = asyncwrapper(async (req, res, next) => {
    const found = await assignedRepo.findByProjectIdAndUserId(req.task.project_id, req.user.id);
    if (!found || found.role === "pending") {
        logger.debug("You are not authorized to view this task");
        const error = new AppError("You are not authorized to view this task", 403);
        return next(error);
    }
    logger.debug(`You are authorized to view this task ${found.role}`);
    req.assigned = found;
    next();
});

const canEditTask = asyncwrapper(async (req, res, next) => {
    if(req.assigned.role !== "admin" && req.task.assigned_to !== req.user.id){
        logger.debug("You are not authorized to edit this task");
        const error = new AppError("You are not authorized to edit this task", 403);
        return next(error);
    }
    logger.debug(`You are authorized to edit this task ${req.assigned.role}`);
    next();
});

const ownerOfTask = asyncwrapper(async (req, res, next) => {
    if(req.assigned.role !== "admin" ){
        logger.debug("You are not the owner of this task");
        const error = new AppError("You are not the owner of this task", 403);
        return next(error);
    }
    logger.debug(`You are the owner of this task ${req.assigned.role}`);
    next();
});

const validateAssignedUser = asyncwrapper(async (req, res, next) => {
    const user = await userRepo.findById(req.params.user_id);
    if (!user) {
        logger.debug("User not found");
        const error = new AppError("User not found", 404);
        return next(error);
    }
    const found = await assignedRepo.findByProjectIdAndUserId(req.task.project_id, req.params.user_id);
    if (!found || found.role === "pending") {
        logger.debug("can't assign task to this user");
        const error = new AppError("can't assign task to this user", 403);
        return next(error);
    }
    logger.debug(`User found ${user.name}`);
    req.assigned_user = user;
    next();
});

module.exports = {
    validateCreateTask,
    taskExist,
    canViewTask,
    canEditTask,
    ownerOfTask,
    validateTime,
    validateAssignedUser
};
