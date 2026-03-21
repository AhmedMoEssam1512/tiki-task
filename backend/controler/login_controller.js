const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const AppError = require('../utils/AppError')
const logger = require('../config/logger')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const signup = asyncwrapper(async (req, res) => {
    logger.debug(`Creating user with data: ${JSON.stringify(req.data)}`);
    const user = await userRepo.create(req.data);
    logger.info(`User created successfully: ${user.id}`);
    res.status(201).json({
        status : "success",
        message: 'User created successfully',
        data : {
            id : user.id,
            name : user.name,
            email : user.email,
            username : user.username,
            phone : user.phone,
            bio : user.bio,
            profile_picture : user.profile_picture,
            createdAt : user.createdAt,
            updatedAt : user.updatedAt
        }
    });
})

const login = asyncwrapper(async (req, res) => {
    logger.debug(`Logging in user with data: ${JSON.stringify(req.body)}`);
    const {identifier, password} = req.body;
    const user = await userRepo.findByEmailOrPhoneOrUsername(identifier, identifier, identifier);
    if(!user){
        logger.debug(`Invalid credentials : ${JSON.stringify({ "identifier": identifier })}`);
        return res.status(401).json({
            status : "error",
            message: 'Invalid credentials',
            data : {
                message: 'Invalid credentials'
            }
        });
    }
    logger.debug(`User found : ${identifier}`);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        logger.debug(`Invalid password : ${JSON.stringify({ "identifier": identifier, "password": password })}`);
        return res.status(401).json({
            status : "error",
            message: 'Invalid credentials',
            data : {
                message: 'Invalid credentials'
            }
        });
    }
    const token = jwt.sign({
        id:user.id
    },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXPIRATION
    }
    )
    res.status(201).json({
        status : "success",
        message: 'User logged in successfully',
        token : token,
        data : {
            id : user.id,
            name : user.name,
            email : user.email,
            username : user.username,
            phone : user.phone,
            bio : user.bio,
            profile_picture : user.profile_picture,
        }
    });
})

const me = asyncwrapper(async (req, res) => {
    logger.debug(`Getting user with data: ${JSON.stringify(req.user)}`);
    const user = await userRepo.findById(req.user.id);
    if(!user){
        logger.debug(`User not found : ${JSON.stringify({ "id": req.user.id })}`);
        return res.status(404).json({
            status : "error",
            message: 'User not found',
            data : {
                message: 'User not found'
            }
        });
    }
    logger.debug(`User found : ${user.id}`);
    res.status(200).json({
        status : "success",
        message: 'User found successfully',
        data : {
            id : user.id,
            name : user.name,
            email : user.email,
            username : user.username,
            phone : user.phone,
            bio : user.bio,
            profile_picture : user.profile_picture,
        }
    });
})

module.exports = {
    signup,
    login,
    me
}