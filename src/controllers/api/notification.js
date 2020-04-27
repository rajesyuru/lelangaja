const { AuctionHistory, Notification, Product, Op } = require('../../models');
const dbUser = require('../../db/user');
const dbProducts = require('../../db/products');
const utilities = require('../../utilities');

exports.notifyOutBid = async (auction_history_id) => {
    const history = await AuctionHistory.findByPk(auction_history_id);

    if (history) {
        const histories = await AuctionHistory.findAll({
            where: {
                product_id: history.product_id,
                id: {
                    [Op.ne]: auction_history_id,
                },
            },
            order: [
                ['price', 'desc']
            ],
        });

        // mencari user_id yang dikalahkan
        let userIds = []; // holder utk unik user_id
        for (let i = 0; i < histories.length; i++) {
            let userId = histories[i].user_id;

            console.log(await dbUser.getUser(userId));

            if ( userId !== history.user_id && userIds.findIndex(id => id === userId) < 0 ) {
                userIds.push(userId);
            }
        }

        for (let i = 0; i < userIds.length; i++) {
            let userId = userIds[i];
            let product = await dbProducts.get(history.product_id);

            await Notification.create({
                user_id: userId,
                product_id: history.product_id,
                message: `Anda baru saja dikalahkan di pelelangan ${product.name}, bid sekarang!`,
            });
        };
    };
};

exports.readAllNotifications = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;
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
        res.send({
            status: 'success'
        })
    } else {
        res.send({
            status: 'error',
            message: 'User tidak ditemukan'
        })
    }
    
};

exports.readNotification = async (product_id, user_id) => {
    await Notification.update(
        {
            read: true
        },
        {
            where: {
                product_id,
                user_id
            }
        }
    );
};

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
                    read: notification.read,
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

exports.notifyAuctionWon = async (product_id, winner_id) => {
    let winner = await AuctionHistory.findOne({
        where: {
            product_id: product_id,
            user_id: winner_id
        }
    });

    if (winner) {
        let product = await dbProducts.get(product_id);
        let latestBid = await dbProducts.getLatestBid(product_id);

        await Notification.create({
            user_id: winner_id,
            product_id: product_id,
            message: `Selamat! Anda telah memenangkan ${product.name} dengan harga terakhir Rp. ${utilities.formatPrice(latestBid)}!`,
        });
    }
};

exports.notifyAuctionLost = async (product_id, winner_id) => {
    const loser = await AuctionHistory.findAll({
        where: {
            product_id: product_id,
            user_id: {
                [Op.ne]: winner_id
            }
        },
        include: ['user'],
        order: [
            ['price', 'desc']
        ],
    });

    // mencari user_id yang dikalahkan
    let userIds = []; // holder utk unik user_id
    for (let i = 0; i < loser.length; i++) {
        let userId = loser[i].user_id;

        // console.log(await dbUser.getUser(userId));

        if (userIds.findIndex(id => id === userId) < 0 ) {
            userIds.push(userId);
        }
    };

    for (let i = 0; i < userIds.length; i++) {
        let userId = userIds[i];

        let product = await dbProducts.get(product_id);

        await Notification.create({
            user_id: userId,
            product_id: product_id,
            message: `Maaf. Anda kalah di pelelangan ${product.name}. Coba lagi di pelelangan berikutnya.`,
        });
    };
};

exports.deleteAllNotifications = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;
        await Notification.destroy({
            where: {
                user_id: id
            }
        })
        res.send({
            status: 'success'
        });
    } else {
        res.send({
            status: 'error',
            message: 'User tidak ditemukan'
        })
    }
};