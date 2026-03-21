const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

const Assigned = sequelize.define('Assigned', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'member', 'admin']]
        }
    }
}, {
    tableName: 'assigned',
    timestamps: true,
});

module.exports = Assigned;

const Project = require('./project_model');
Assigned.belongsTo(Project, { 
    as: 'project',        // ← Must match your include query 'as'
    foreignKey: 'project_id' 
});