const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const AppError = require('../utils/AppError')
const logger = require('../config/logger')
const validator = require('validator')
const bcrypt = require('bcrypt')

const checkData = asyncwrapper(async (req, res, next) => {
    const {name, email, password, username, phone} = req.body;
    logger.debug(`Checking data : ${JSON.stringify({ "name": name, "email": email, "password": password, "username": username, "phone": phone })}`);
    if(!name || !email || !password || !username || !phone){
        const error = AppError.create('All fields are required', 400);
        logger.debug(`Error creating user: ${error}`);
        return next(error);
    }
    req.data = req.body;
    next();
})

const validateEmail = asyncwrapper(async (req, res, next) => {
    const email = req.data.email;
    logger.debug(`Validating email : ${JSON.stringify({ "email": email })}`);
    if (!validator.isEmail(email)) {
        logger.debug(`Email format is not valid : ${JSON.stringify({ "email": email })}`);
        const error = AppError.create("Email format is not valid", 400);
        return next(error);
    }
    logger.debug(`Email is valid : ${JSON.stringify({ "email": email })}`);
    next();
});

const encryptPassword = asyncwrapper(async (req, res, next) => {
    const password = req.data.password;
    const encryptedPassword = await bcrypt.hash(password, 10);
    logger.debug(`Password encrypted successfully`);
    req.data.password = encryptedPassword;
    next();
});

const userExists = asyncwrapper(async (req, res, next) => {
    const email = req.data.email;
    const phone = req.data.phone;
    const username = req.data.username;
    logger.debug(`Checking if user exists : ${JSON.stringify({ "email": email, "phone":phone, "username":username })}`);
    let user = await userRepo.findByEmail(email); 
    if(user){
        const error = AppError.create("email already exists", 400);
        logger.debug(`email already exists : ${JSON.stringify({ "email": email })}`);
        return next(error);
    }
    user = await userRepo.findByPhone(phone); 
    if(user){
        const error = AppError.create("phone already exists", 400);
        logger.debug(`phone already exists : ${JSON.stringify({ "phone": phone })}`);
        return next(error);
    }
    user = await userRepo.findByUsername(username); 
    if(user){
        const error = AppError.create("username already exists", 400);
        logger.debug(`username already exists : ${JSON.stringify({ "username": username })}`);
        return next(error);
    }
    next();
});

module.exports = {
    checkData,
    validateEmail,
    encryptPassword,
    userExists
}

