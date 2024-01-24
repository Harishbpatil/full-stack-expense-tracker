const Sequelize = require('sequelize')

const sequelize = require('../util/db')

const Expense = sequelize.define('expense' , {
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },
    expense :{
        type : Sequelize.STRING,
        allowNull : false
    },
    description : {
        type : Sequelize.STRING,
        allowNull : false
    },
    category : {
        type : Sequelize.STRING,
        allowNull : false
    }
})

module.exports = Expense;