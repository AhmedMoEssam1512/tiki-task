const User = require('../models/user_model');
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

module.exports = {
    create,
    findByEmail,
    findByUsername,
    findByPhone,
    findByEmailOrPhoneOrUsername,
    findById,
    update
}