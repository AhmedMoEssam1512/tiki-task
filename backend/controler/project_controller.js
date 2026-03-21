const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const projectRepo = require('../repo/project_repo')
const logger = require('../config/logger')
const assignedRepo = require('../repo/assigned_repo')

const getAllProjects = asyncwrapper(async (req, res) => {
    const ownedProjects = await assignedRepo.findProjectsGroupedByStatus(req.user.id, 'admin');
    logger.debug(`owned projects fetched`);
    const assignedProjects = await assignedRepo.findProjectsGroupedByStatus(req.user.id, 'member');
    logger.debug(`assigned projects fetched`);
    const pendingProjects = await assignedRepo.findProjectsGroupedByStatus(req.user.id, 'pending');
    logger.debug(`pending projects fetched`);
    logger.info(`Projects fetched`);
    res.status(200).json({
        status: 'success',
        message: 'Projects fetched successfully',
        data: {
            ownedProjects,
            assignedProjects,
            pendingProjects
        }
    });
})

const getProjectById = asyncwrapper(async (req, res) => {
    const project = req.project;
    logger.info(`Project fetched`);
    res.status(200).json({
        status: 'success',
        message: 'Project fetched successfully',
        data: project
    });
})

const updateProject = asyncwrapper(async (req, res) => {
    const project = req.project;
     // Get values from body or fallback to existing project values
    const startDateInput = req.body.start_date || project.start_date;
    const endDateInput = req.body.end_date || project.end_date;
    
    // 🔧 CONVERT TO DATE OBJECTS BEFORE COMPARING ⚡
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    
    logger.debug(`Start date (parsed): ${startDate}`);
    logger.debug(`End date (parsed): ${endDate}`);
    logger.debug(`Is start > end? ${startDate > endDate}`);
    
    // Validate: start must be before or equal to end
    if (isNaN(startDate) || isNaN(endDate)) {
        logger.debug(`Invalid date format: ${JSON.stringify(req.body)}`);
        return res.status(400).json({
            status: 'error',
            message: 'Invalid date format. Use ISO 8601 (e.g., 2026-05-20T10:30:00.000Z)'
        });
    }
    if (startDate > endDate) {
        logger.debug(`Invalid date range: start_date after end_date`);
        return res.status(400).json({
            status: 'error',
            message: 'Invalid date range: start_date must be before or equal to end_date'
        });
    }
    const updatedProject = await projectRepo.update(project, req.body);
    logger.info(`Project updated`);
    res.status(200).json({
        status: 'success',
        message: 'Project updated successfully',
        data:{
            project: updatedProject
        } 
    });
})

const deleteProject = asyncwrapper(async (req, res) => {
    const project = req.project;
    await projectRepo.deleteProject(project);
    logger.info(`Project deleted`);
    res.status(200).json({
        status: 'success',
        message: 'Project deleted successfully'
    });
})



module.exports = {
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
}