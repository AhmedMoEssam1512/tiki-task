const Task = require("../models/task_model");
const User = require("../models/user_model");
const Project = require("../models/project_model");

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

function findById(taskId) {
    return Task.findOne({
        where: {
            id: taskId
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

function getAllTasksByUser(userId,status) {
    return Task.findAll({
        where: {
            assigned_to: userId,
            status:status
        },
        attributes: ['id', 'name', 'description', 'status', 'due_date', 'project_id', 'assigned_to'],
        order: [
            ['due_date', 'ASC']
        ],
        include: [
            {
                model: Project,
                as: 'project',
                attributes: ['id', 'name']
            }
        ]
    });
}

async function updateTask(taskId, task) {
    await Task.update(task, {where: {id: taskId}});
    return findById(taskId);
}

function deleteTask(taskId) {
    return Task.destroy({where: {id: taskId}});
}

module.exports = {
    createTask,
    getAllTasksByProjectId,
    findById,
    getAllTasksByUser,
    updateTask,
    deleteTask
};