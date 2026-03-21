const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const AppError = require('../utils/AppError')
const logger = require('../config/logger')

const userFound = asyncwrapper(async (req, res, next) => {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
        logger.debug(`User not found : ${JSON.stringify(user)}`);
        return next(new AppError('User not found', 404));
    }
    req.user = user;
    next();
})


const checkDuplicate = asyncwrapper(async (req, res, next) => {

    const {username, phone} = req.body;
    if(username){
        const user = await userRepo.findByUsername(username);
        if(user && user.id !== req.user.id){
            logger.debug(`User found : ${JSON.stringify(user)}`);
            return next(new AppError('Username already exists', 400));
        }
    }
    if(phone){
        const user = await userRepo.findByPhone(phone);
        if(user && user.id !== req.user.id){
            logger.debug(`User found : ${JSON.stringify(user)}`);
            return next(new AppError('Phone already exists', 400));
        }
    }
    next();
})



module.exports = {
    userFound,
    checkDuplicate
}