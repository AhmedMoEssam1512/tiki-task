const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const projectRepo = require('../repo/project_repo')
const logger = require('../config/logger')
const assignedRepo = require('../repo/assigned_repo')

const editProfile = asyncwrapper(async (req, res, next) => {
    req.body.id = req.user.id;
    req.body.updatedAt = new Date();
    req.body.email = req.user.email;
    req.body.password = req.user.password;
    const user = await userRepo.update(req.user.id, req.body);
    logger.debug(`User updated : ${JSON.stringify(user)}`);
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            profile_picture: user.profile_picture,
            bio: user.bio,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    })
})

const createProject = asyncwrapper(async (req, res) => {
    req.body.owner_id = req.user.id;
    let {start_date, end_date} = req.body;
    start_date = start_date ? new Date(start_date) : new Date();
    end_date = end_date ? new Date(end_date) : new Date(start_date.getTime() + 14 * 24 * 60 * 60 * 1000);
    if(start_date > end_date){
        logger.debug(`Invalid date : ${JSON.stringify(req.body)}`);
        return res.status(400).json({
            status: 'error',
            message: 'Invalid dates'
        });
    }
    req.body.start_date = start_date;
    req.body.end_date = end_date;
    const project = await projectRepo.create(req.body);
    logger.debug(`Project created : ${JSON.stringify(project)}`);
    res.status(200).json({
        success: true,
        message: 'Project created successfully',
        data: project
    })
})

const enterProjectUsingCode = asyncwrapper(async (req, res) => {
    const assigned = await assignedRepo.create({
        project_id: req.project.id,
        user_id: req.user.id,
        role: 'pending'
    })
    logger.debug(`Project assigned : ${JSON.stringify(assigned)}`);
    res.status(200).json({
        success: true,
        message: 'Project assigned successfully',
        data: assigned
    })
    
})

module.exports = {
    editProfile,
    createProject,
    enterProjectUsingCode
}

