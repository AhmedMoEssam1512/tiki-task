const Task = require("../models/task_model");

function createTask(task) {
    return Task.create(task);
}

module.exports = {
    createTask
};