const {asyncwrapper} = require('../utils/asyncwrapper')
const userRepo = require('../repo/user_repo')
const AppError = require('../utils/AppError')
const logger = require('../config/logger')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// Import services
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');

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
    logger.info(`User logged in successfully: ${user.username}`);
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
    logger.info(`User found : ${user.username}`);
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

const changePassword = asyncwrapper(async (req, res) => {
    logger.debug(`Changing password for user: ${JSON.stringify(req.user)}`);
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
    const isPasswordValid = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!isPasswordValid){
        logger.debug(`Invalid password : ${JSON.stringify({ "identifier": req.body.oldPassword })}`);
        return res.status(401).json({
            status : "error",
            message: 'Invalid credentials',
            data : {
                message: 'Invalid credentials'
            }
        });
    }
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await userRepo.update(req.user.id, { password: hashedPassword });
    logger.info(`User found : ${user.username}`);
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



/**
 * STEP 1: Request password reset (send OTP via email)
 */
const forgetPassword = asyncwrapper(async (req, res) => {
    logger.debug(`Forget password request: ${JSON.stringify(req.params)}`);
    
    const { email } = req.params;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            status: 'error',
            message: 'Valid email is required'
        });
    }
    
    const user = await userRepo.findByEmail(email);
    if (!user) {
        logger.debug(`Password reset requested for non-existent email: ${email}`);
        return res.status(200).json({
            status: 'success',
            message: 'If an account exists with this email, you will receive a password reset OTP',
            data: { message: 'Check your email' }
        });
    }
    
    if (otpService.hasActiveOTP(user.id)) {
        return res.status(429).json({
            status: 'error',
            message: 'Please wait before requesting another reset code',
            data: { retryAfter: '15 minutes' }
        });
    }
    
    logger.info(`Password reset initiated for user: ${user.username} (ID: ${user.id})`);
    
    try {
        const otp = otpService.generateOTP();
        otpService.storeOTP(user.id, otp); 
        await emailService.sendPasswordResetEmail(user.email, user.username, otp);
        
        res.status(200).json({
            status: 'success',
            message: 'If an account exists with this email, you will receive a password reset OTP',
            data: { message: 'Check your email', email: user.email }
        });
        
    } catch (error) {
        logger.error(`Forget password failed for ${email}: ${error.message}`);
        otpService.clearOTP(user.id);
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to process password reset request. Please try again later.'
        });
    }
});

/**
 * STEP 2: Verify OTP code (mark as confirmed)
 */
const verifyOTP = asyncwrapper(async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and OTP are required'
        });
    }
    
    const user = await userRepo.findByEmail(email);
    if (!user) {
        return res.status(404).json({
            status: 'error',
            message: 'User not found'
        });
    }
    
    const isValid = otpService.verifyOTP(user.id, otp);
    if (!isValid) {
        logger.debug(`Invalid/expired OTP attempt for user ${user.id}`);
        return res.status(400).json({
            status: 'error',
            message: 'Invalid or expired OTP. Please request a new one.'
        });
    }
    
    otpService.confirmOTP(user.id);
    logger.info(`OTP confirmed for user: ${user.username}`);
    
    res.status(200).json({
        status: 'success',
        message: 'OTP verified. You can now reset your password.',
        data: { email: user.email }
    });
});

/**
 * STEP 3: Reset password (only if OTP is confirmed)
 */
const resetPassword = asyncwrapper(async (req, res) => {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and new password are required'
        });
    }
    
    const user = await userRepo.findByEmail(email);
    if (!user) {
        return res.status(404).json({
            status: 'error',
            message: 'User not found'
        });
    }
    
    const completed = otpService.completeReset(user.id);
    if (!completed) {
        logger.debug(`Password reset attempted without confirmed OTP for user ${user.id}`);
        return res.status(400).json({
            status: 'error',
            message: 'OTP not verified. Please verify your OTP first.'
        });
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = encryptedPassword; 
    await user.save();
    
    logger.info(`Password reset successful for user: ${user.username}`);
    
    res.status(200).json({
        status: 'success',
        message: 'Password reset successfully. You can now login with your new password.',
        data: { email: user.email }
    });
});



module.exports = {
    signup,
    login,
    me,
    forgetPassword,
    verifyOTP,
    resetPassword,
    changePassword
}