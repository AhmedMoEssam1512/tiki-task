const User = require('../models/user_model');
const Project = require('../models/project_model');
const Assigned = require('../models/assigned_model');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const create = async (userData) => {
    return await User.create(userData);
}

function findByEmail(email) {
    return  User.findOne({ where: { email } });
}

function findByUsername(username) {
    return  User.findOne({ where: { username } });
}

function findByPhone(phone)  {
    return  User.findOne({ where: { phone } });
}

function findByEmailOrPhoneOrUsername(email, phone, username) {
    const found =  User.findOne({
        where: {
            [Op.or]: [
                { email },
                { phone },
                { username }
            ]
        }
    })
    logger.debug(`User found : ${JSON.stringify(found)}`);
    return found;
}

function findById(id) {
    return User.findByPk(id);
}

async function update(id, userData) {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    user.set(userData);
    return user.save();
}

async function deleteUser(id) {
    return User.destroy({ where: { id } });
}

async function viewProfile(id) {
    // 1. Get user with selected attributes only (exclude sensitive fields)
    const user = await User.findByPk(id, {
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'] // ✅ Exclude these
        },
        // Optional: Include profile picture URL processing if needed
        raw: false // Keep as model instance for potential hooks
    });
    
    if (!user) {
        return null;
    }
    
    // 2. Count projects owned by user (owner_id)
    const ownedProjectsCount = await Project.count({
        where: { owner_id: id }
    });
    
    // 3. Count projects where user is a 'member' (not admin/owner)
    const memberProjectsCount = await Assigned.count({
        where: {
            user_id: id,
            role: 'member' // ✅ Only count 'member' role, not 'admin'
        }
    });
    
    // 4. Get plain object (remove Sequelize metadata)
    const userData = user.get({ plain: true });
    
    // 5. Add project counts
    userData.owned_projects_count = ownedProjectsCount;
    userData.member_projects_count = memberProjectsCount;
    
    // 6. Return clean profile object
    return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        bio: userData.bio,
        profile_picture: userData.profile_picture,
        owned_projects_count: userData.owned_projects_count,
        member_projects_count: userData.member_projects_count
    };
}


module.exports = {
    create,
    findByEmail,
    findByUsername,
    findByPhone,
    findByEmailOrPhoneOrUsername,
    findById,
    update,
    deleteUser,
    viewProfile
}