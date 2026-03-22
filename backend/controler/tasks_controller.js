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

module.exports = {
    createTask
};
