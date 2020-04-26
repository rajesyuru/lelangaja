const dbProduct = require('../../db/products');
const utilities = require('../../utilities');
const dbNotifications = require('../../db/notifications');
const { Notification } = require('../../models')

exports.index = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;

        let products = await dbProduct.activeProducts();

        res.render('dashboard', {
            products: products,
            logged_in_id: id,
            notifications: await dbNotifications.notifications(id),
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

        let notificationsList = await dbNotifications.notificationsAll(id);
        let notifications = await dbNotifications.notifications(id);

        await Notification.update(
            {
                read: true
            },
            {
                where:  {
                    user_id: id
                }
            }
        );
        
        res.render('notifications', {
            notificationsList: notificationsList,
            notifications: notifications
        });
    } else {
        // redirect ke hal login
        res.redirect('/');
    }
};