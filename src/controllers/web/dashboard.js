const dbProduct = require('../../db/products');
const utilities = require('../../utilities');
const { Notification } = require('../../models');
const notificationController = require('../api/notification');

exports.index = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;

        let products = await dbProduct.activeProducts();

        let notifications = await notificationController.notifications(id);

        // console.log(notifications);

        res.render('dashboard', {
            products: products,
            logged_in_id: id,
            notifications: notifications,
            formatPrice: utilities.formatPrice,
        });
    } else {
        // redirect ke hal login
        res.redirect('/');
    }
};

exports.notifications = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;

        // console.log(await notificationController.notificationsAll(id));

        res.render('notifications', {
            notificationsList: await notificationController.notificationsAll(id),
            notifications: await notificationController.notifications(id)
        });
    } else {
        // redirect ke hal login
        res.redirect('/');
    }
};