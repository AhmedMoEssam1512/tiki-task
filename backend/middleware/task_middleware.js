const {asyncwrapper}= require("../utils/asyncwrapper");
const logger = require("../config/logger");
const taskRepo= require ("../repo/task_repo")
const projectRepo = require("../repo/project_repo");
const AppError = require("../utils/AppError");

const validateCreateTask = asyncwrapper(async (req, res, next) => {
    const { name, description, due_date, project_id } = req.body;
    if (!name || !description || !due_date || !project_id) {
        logger.error("All fields are required");
        const error = new AppError("All fields are required", 400);
        return next(error);
    }
    const project = await projectRepo.findById(project_id);
    if (!project) {
        logger.error("Project not found");
        const error = new AppError("Project not found", 404);
        return next(error);
    }
    if (project.owner_id !== req.user.id) {
        logger.error("You are not authorized to create task in this project");
        const error = new AppError("You are not authorized to create task in this project", 403);
        return next(error);
    }
    const deadline = new Date(due_date);
    if(deadline < Date.now()){
        logger.error("Due date is in the past");
        const error = new AppError("Due date is in the past", 400);
        return next(error);
    }
    if(deadline > project.end_date){
        logger.error("Due date is greater than project end date");
        const error = new AppError("Due date is greater than project end date", 400);
        return next(error);
    }
    if(deadline < project.start_date){
        logger.error("Due date is less than project start date");
        const error = new AppError("Due date is less than project start date", 400);
        return next(error);
    }
    logger.debug("task can be created");
    next();
});

module.exports = {
    validateCreateTask
};
