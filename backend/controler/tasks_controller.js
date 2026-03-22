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

module.exports = {
    createTask,
    getAllTasksByProjectId
};
