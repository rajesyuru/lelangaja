const { sequelize, Notification, Product, User } = require('../models');

exports.notificationsAll = async (user_id) => {
    const notifications = await Notification.findAll({
        where: {
            user_id: user_id
        },
        include: ['user', 'product'],
        order: [
            ['createdAt', 'desc']
        ]
    });

    if (notifications.length !== 0) {
        let out = [];

        for (i = 0; i < notifications.length; i++) {
            let notification = notifications[i];
           
            let product = await Product.findOne({
                where: {
                    id: notification.product_id,
                    // status: sequelize.literal(`status is distinct from 'selesai'`)   
                }
            });

            // console.log(product)

            if (product) {
                out.push({
                    id: notification.id,
                    product: {
                        id: product.id,
                        name: product.name,
                        image: product.image
                    },
                    message: notification.message
                });
            } else {
                out = null;
            };
        };

        return out;
    } else {
        return null;
    }
};
exports.notifications = async (user_id) => {
    const notifications = await Notification.findAll({
        where: {
            user_id: user_id,
            read: false
        },
        include: ['user', 'product'],
        order: [
            ['createdAt', 'desc']
        ]
    });

    if (notifications.length !== 0) {
        let out = [];

        for (i = 0; i < notifications.length; i++) {
            let notification = notifications[i];
           
            let product = await Product.findOne({
                where: {
                    id: notification.product_id,
                    // status: sequelize.literal(`status is distinct from 'selesai'`)   
                }
            });

            // console.log(product)

            if (product) {
                out.push({
                    id: notification.id,
                    product: {
                        id: product.id,
                        name: product.name,
                        image: product.image
                    },
                    message: notification.message
                });
            } else {
                out = null;
            };
        };

        return out;
    } else {
        return null;
    }
};