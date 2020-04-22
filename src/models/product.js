module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('products', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        multiplier: DataTypes.DOUBLE,
        image: DataTypes.STRING,
        description: DataTypes.STRING(2000),
        end_date: DataTypes.DATE,
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        winner_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    });

    return Product;
};
