module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('messages', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: DataTypes.INTEGER,
        owner_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        message: DataTypes.STRING(5000),
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    return Message;
};