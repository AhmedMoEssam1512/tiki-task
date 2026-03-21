const Assigned = require('../models/assigned_model');

function create(assignedData) {
    return Assigned.create(assignedData);
}

function findByProjectIdAndUserId(projectId, userId) {
    return Assigned.findOne({
        where: {
            project_id: projectId,
            user_id: userId
        }
    });
}

module.exports = {
    create,
    findByProjectIdAndUserId
}