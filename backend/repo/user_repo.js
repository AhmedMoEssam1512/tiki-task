const User = require('../models/user_model');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const create = async (userData) => {
    return await User.create(userData);
}

const findByEmail = async (email) => {
    return await User.findOne({ where: { email } });
}

const findByUsername = async (username) => {
    return await User.findOne({ where: { username } });
}

const findByPhone = async (phone) => {
    return await User.findOne({ where: { phone } });
}

const findByEmailOrPhoneOrUsername = async (email, phone, username) => {
    const found = await User.findOne({
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

module.exports = {
    create,
    findByEmail,
    findByUsername,
    findByPhone,
    findByEmailOrPhoneOrUsername
}