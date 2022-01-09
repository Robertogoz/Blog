const Sequelize = require('sequelize');
const Category = require('../Categories/Category');
const connection = require('../database/database');

const Article = connection.define('articles', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },

    body: {
        type: Sequelize.TEXT,
        allowNull: false
    },

    slug : {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Article.belongsTo(Category);
Category.hasMany(Article);


Article.sync({force: false});

module.exports = Article;