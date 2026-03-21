const Project = require('../models/project_model');
const Assigned = require('../models/assigned_model');

async function create(projectData) {
    const project = await Project.create(projectData);
    await Assigned.create({
        project_id: project.id,
        user_id: projectData.owner_id,
        role: 'admin'
    })
    return project;
}

function findById(id){
    return Project.findByPk(id);
}

module.exports = {
    create,
    findById
}   