module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('notifications', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        message: DataTypes.STRING,
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    return Notification;
};