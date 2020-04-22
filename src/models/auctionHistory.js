module.exports = (sequelize, DataTypes) => {
    const AuctionHistory = sequelize.define('auction_histories', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        price: DataTypes.DOUBLE,
    });

    return AuctionHistory;
};