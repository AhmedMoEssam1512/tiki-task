const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const AppError = require('../utils/AppError')
const logger = require('../config/logger')
const projectRepo = require('../repo/project_repo')
const assignedRepo = require('../repo/assigned_repo')

const projectExist = asyncwrapper(async (req, res, next) => {
    const project = await projectRepo.findById(req.params.id);
    if(!project){
        logger.debug(`Project not found : ${JSON.stringify(req.params)}`);
        return res.status(404).json({
            status: 'error',
            message: 'Project not found'
        });
    }
    logger.debug(`Project found : ${JSON.stringify(project)}`);
    req.project = project;
    next();
})

const isMember = asyncwrapper(async (req, res, next) => {
    const assigned = await assignedRepo.findByProjectIdAndUserId(req.project.id, req.user.id);
    if(!assigned){
        logger.debug(`User not assigned or pending to project : ${JSON.stringify(req.user.id)}`);
        const error = new AppError('You are not assigned or pending to this project', 403);
        return next(error);
    }
    if(assigned.role === 'pending'){
        logger.debug(`User not assigned or pending to project : ${JSON.stringify(req.user.id)}`);
        const error = new AppError('You are not assigned or pending to this project', 403);
        return next(error);
    }
    req.assigned = assigned;
    next();
})

const isOwner = asyncwrapper(async (req, res, next) => {
    const assigned = await assignedRepo.findByProjectIdAndUserId(req.project.id, req.user.id);
    if(!assigned){
        logger.debug(`User not assigned or pending to project : ${JSON.stringify(req.user.id)}`);
        const error = new AppError('You are not assigned or pending to this project', 403);
        return next(error);
    }
    if(assigned.role !== 'admin'){
        logger.debug(`User not admin of this project : ${JSON.stringify(req.user.id)}`);
        const error = new AppError('You are not the owner of this project', 403);
        return next(error);
    }
    
    req.assigned = assigned;
    next();
})

const alreadyAssigned = asyncwrapper(async (req, res, next) => {
    const assigned = await assignedRepo.findByProjectIdAndUserId(req.project.id, req.user.id);
    if(assigned){
        logger.debug(`User already assigned or pending to project : ${JSON.stringify(req.user.id)}`);
        const error = new AppError('You are already assigned or pending to this project', 403);
        return next(error);
    }
    next();
})

const isPending = asyncwrapper(async (req, res, next) => {
    const assigned = await assignedRepo.findByProjectIdAndUserId(req.project.id, req.params.userId);
    if(assigned.role !== 'pending'){
        logger.debug(`User not pending of this project : ${JSON.stringify(req.params.userId)}`);
        const error = new AppError('this user is not pending for this project', 403);
        return next(error);
    }
    req.assigned = assigned;
    next();
})



module.exports = {
    projectExist,
    isMember,
    isOwner,
    alreadyAssigned,
    isPending
}