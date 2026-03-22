const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },
    
}, {
    tableName: 'tasks',
    timestamps: true,
});

module.exports = Task;

const User = require('./user_model');
Task.belongsTo(User, {
    as: 'user',
    foreignKey: 'assigned_to'
});

const Project = require('./project_model');
Task.belongsTo(Project, {
    as: 'project',
    foreignKey: 'project_id'
});
