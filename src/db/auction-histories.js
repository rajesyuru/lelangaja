const moment = require('moment-timezone');

const { AuctionHistory } = require('../models');

exports.getAuctions = async (product_id) => {
    const histories = await AuctionHistory.findAll({
        where: {
            product_id: product_id,
        },
        include: ['user', 'product'],
        order: [
            ['createdAt', 'desc']
        ]
    });
//     const sql = `
// select
//     ah.*,
//     u.id as user_id,
//     u.name as user_name,
//     u.email as user_email,
//     p.id as product_id,
//     p.name as product_name,
//     p.description as product_description,
//     p.image as product_image,
//     p.multiplier as product_multiplier,
//     p.end_date as product_end_date
// from
//     auction_histories ah,
//     users u,
//     products p
// where
//     ah.user_id = u.id and
//     ah.product_id = p.id and
//     ah.product_id = $1
// order by
//     created_at desc
//     `;

    let con = histories.map(history => {
        return {
            id: history.id,
            price: history.price,
            created_at: moment.tz(history.createdAt, 'Asia/Jakarta'),
            user: {
                id: history.user.id,
                name: history.user.name,
                email: history.user.email,
            },
            product: {
                id: history.product.id,
                name: history.product.name,
                description: history.product.description,
                image: history.product.image,
                multiplier: history.product.multiplier,
                end_date: moment.tz(history.product.end_date, 'Asia/Jakarta'),
            },
        };
    });

    // console.log(con);

    return con;
};

exports.add = async (user_id, product_id, price) => {
    let history = await AuctionHistory.create({
        user_id,
        product_id,
        price
    });

    return history;
};