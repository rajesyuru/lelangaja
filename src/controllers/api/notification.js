const { AuctionHistory, Notification, Op } = require('../../models');
const dbUser = require('../../db/user');

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

            await Notification.create({
                user_id: userId,
                product_id: history.product_id,
                message: `Anda baru saja dikalahkan, bid sekarang.`,
            });
        };
    };
};