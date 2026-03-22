const Task = require("../models/task_model");
const User = require("../models/user_model");

function createTask(task) {
    return Task.create(task);
}

function getAllTasksByProjectId(projectId) {
    return Task.findAll({
        where: {
            project_id: projectId
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }
        ]
    });
}

module.exports = {
    createTask,
    getAllTasksByProjectId
};