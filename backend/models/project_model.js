const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    end_date:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            const date = new Date();
            date.setDate(date.getDate() + 14);
            return date;
        }
    },   
}, {
    tableName: 'projects',
    timestamps: true,
});

module.exports = Project;