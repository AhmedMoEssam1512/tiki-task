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

module.exports = {
    getAllProjects,
    getProjectById
}