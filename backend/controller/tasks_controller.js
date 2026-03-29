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
    const completedTasks = await taskRepo.getAllTasksByUser(req.user.id,"finished");
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

const updateTask = asyncwrapper(async (req, res) => {
    logger.debug(`updating Task ${JSON.stringify(req.body)}`);
    req.body.project_id = req.task.project_id;
    const task = await taskRepo.updateTask(req.params.id, req.body);
    logger.info(`Task updated successfully ${JSON.stringify(task)}`);
    res.status(200).json({
        success:true,
        message:"Task updated successfully",
        data:task
    });
});

const deleteTask = asyncwrapper(async (req, res) => {
    await taskRepo.deleteTask(req.params.id);
    logger.info("Task deleted successfully");
    res.status(200).json({
        success:true,
        message:"Task deleted successfully",
    });
});

const assignTask = asyncwrapper(async (req, res) => {
    logger.debug(`assigning Task ${JSON.stringify(req.body)}`);
    const task = await taskRepo.updateTask(req.params.id, {assigned_to:req.assigned_user.id, status:"in-progress"});
    logger.info(`Task assigned successfully ${JSON.stringify(task)}`);
    res.status(200).json({
        success:true,
        message:"Task assigned successfully",
        data:task
    });
});

const markAsDone = asyncwrapper(async (req, res) => {
    logger.debug(`marking Task ${JSON.stringify(req.body)}`);
    const task = await taskRepo.updateTask(req.params.id, {status:"finished"});
    logger.info(`Task marked as done successfully ${JSON.stringify(task)}`);
    res.status(200).json({
        success:true,
        message:"Task marked as done successfully",
        data:task
    });
});

module.exports = {
    createTask,
    getAllTasksByProjectId,
    getTaskById,
    getAllTasksByUser,
    updateTask,
    deleteTask,
    assignTask,
    markAsDone
};
