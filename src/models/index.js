const { Sequelize, Model, DataTypes, Op } = require('sequelize');

const userModel = require('./user');
const productModel = require('./product');
const auctionHistoryModel = require('./auctionHistory');
const notificationModel = require('./notification');

const databaseURL = process.env.DATABASE_URL || null;
const dbClient = 'postgresql';
const dbHost = 'localhost';
const dbName = 'lelangaja';
const dbUserName = 'postgres';
const dbPassword = 'jakarta123';
const logging = false;
const timezone = '+07:00'

let sequelize;

if (databaseURL) {
    sequelize = new Sequelize(databaseURL, {
        dialect: dbClient,
        host: dbHost,
        logging: logging,
        timezone: timezone
    });
} else {
    sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
        dialect: dbClient,
        host: dbHost,
        logging: logging,
        timezone: timezone
    });
}

let model = {};

model.sequelize = sequelize;
model.Op = Op;
model.User = userModel(sequelize, DataTypes);
model.Product = productModel(sequelize, DataTypes);
model.AuctionHistory = auctionHistoryModel(sequelize, DataTypes);
model.Notification = notificationModel(sequelize, DataTypes);

// relations
model.User.hasMany(model.Product, {
    as: 'products',
    foreignKey: 'user_id',
});

model.Product.belongsTo(model.User, {
    as: 'user',
    foreignKey: 'user_id',
});

model.Product.belongsTo(model.User, {
    as: 'winner',
    foreignKey: 'winner_id',
});

model.AuctionHistory.belongsTo(model.User, {
    as: 'user',
    foreignKey: 'user_id',
});

model.AuctionHistory.belongsTo(model.Product, {
    as: 'product',
    foreignKey: 'product_id',
});

model.Notification.belongsTo(model.User, {
    as: 'user',
    foreignKey: 'user_id',
});

model.Notification.belongsTo(model.Product, {
    as: 'product',
    foreignKey: 'product_id',
});


module.exports = model;