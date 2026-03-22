const {asyncwrapper}= require("../utils/asyncwrapper");
const logger = require("../config/logger");
const taskRepo= require ("../repo/task_repo")

const createTask = asyncwrapper(async (req, res) => {

    const task = await taskRepo.createTask(req.body);
    logger.info("Task created successfully");
    res.status(201).json({
        success:true,
        message:"Task created successfully",
        data:task
    });
});

const getAllTasksByProjectId = asyncwrapper(async (req, res) => {
    const tasks = await taskRepo.getAllTasksByProjectId(req.project.id);
    logger.info("Tasks fetched successfully");
    res.status(200).json({
        success:true,
        message:"Tasks fetched successfully",
        data:tasks
    });
});

const getTaskById = asyncwrapper(async (req, res) => {
    const task = req.task;
    logger.info("Task fetched successfully");
    res.status(200).json({
        success:true,
        message:"Task fetched successfully",
        data:task
    });
});

const getAllTasksByUser = asyncwrapper(async (req, res) => {
    const inProgressTasks = await taskRepo.getAllTasksByUser(req.user.id,"in-progress");
    const completedTasks = await taskRepo.getAllTasksByUser(req.user.id,"completed");
    logger.info("Tasks fetched successfully");
    res.status(200).json({
        success:true,
        message:"Tasks fetched successfully",
        data:{
            inProgressTasks,
            completedTasks
        }
    });
});

module.exports = {
    createTask,
    getAllTasksByProjectId,
    getTaskById,
    getAllTasksByUser
};
