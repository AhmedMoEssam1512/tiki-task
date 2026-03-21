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

async function update(project, projectData){
    const updatedProject = await project.update(projectData);
    return updatedProject;
}

async function deleteProject(project){
    return project.destroy();
}

module.exports = {
    create,
    findById,
    update,
    deleteProject
}   