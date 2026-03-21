const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const logger = require('../config/logger')

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

//const createProject = asyncwrapper(async (req, res, next) => {})

//const enterProjectUsingCode = asyncwrapper(async (req, res, next) => {})

module.exports = {
    editProfile
}

