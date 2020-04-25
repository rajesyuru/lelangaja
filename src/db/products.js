const moment = require('moment-timezone');

const { Product, AuctionHistory, sequelize, Op, User } = require('../models');

exports.addProduct = async (user, product) => {
    await Product.create({
        user_id: user.id,
        name: product.name,
        image: product.image,
        description: product.description,
        multiplier: product.multiplier,
        end_date: product.end_date,
    });
};

exports.activeProducts = async () => {
    const products = await Product.findAll({
        include: ['user'],
        order: [
            ['createdAt', 'desc']
        ]
    });

    let out = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const latest_bid = await exports.getLatestBid(product.id);

        out.push({
            id: product.id,
            name: product.name,
            multiplier: product.multiplier,
            image: product.image,
            description: product.description,
            end_date: moment.tz(product.end_date, 'Asia/Jakarta'),
            status: product.status,
            user: {
                id: product.user.id,
                name: product.user.name,
                email: product.user.email,
            },
            latest_bid: latest_bid,
        });
    };

    // console.log(out)

    return out;
};

exports.get = async (id) => {
    const product = await Product.findByPk(id, {
        include: ['user']
    });

    if (product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            multiplier: product.multiplier,
            end_date: moment.tz(product.end_date, 'Asia/Jakarta'),
            owner: {
                id: product.user.id,
                name: product.user.name,
            },
            status: product.status
        };
    } else {
        return false;
    }
}

exports.getLatestBid = async (id) => {
    const bid = await AuctionHistory.findOne({
        where: {
            product_id: id,
        },
        order: [
            ['createdAt', 'desc']
        ],
    });

    if (bid) {
        return bid.price;
    } else {
        return 0;
    }
};



exports.bidWinner = async (id) => {
    const history = await AuctionHistory.findOne({
        where: {
            product_id: id,
        },
        include: ['user', 'product'],
        order: [
            ['createdAt', 'desc'],
        ],
    });

    if (history) {
        return {
            winner_id: history.user.id,
            winner_name: history.user.name,
            product_id: history.product.id,
            price: history.price
        };

    } else {
        return null;
    }
};

exports.endBid = async (id, winner_id) => {
    const product = await Product.findByPk(id);

    if (product) {
        product.status = 'selesai';
        product.winner_id = winner_id;

        product.save();

        product.end_date = product.updatedAt;

        product.save();
    }
 
    // const sql = `
    // update
    //     products
    // set
    //     end_date = now(),
    //     status = $1,
    //     winner_id = $2
    // where
    //     id = $3
    // `;

    // let values = ['selesai', winner_id, id];

    // await client.query(sql, values);
}

exports.wonBid = async (user_id) => {
    const products = await Product.findAll({
        where: {
            status: 'selesai',
            winner_id: user_id
        },
        order: [
            ['end_date', 'desc']
        ],
        include: ['user']
    });

    // const sql = `
    // select
    //     *
    // from
    //     products
    // where
    //     status = 'selesai' and
    //     winner_id = $1
    // order by
	//     end_date desc
    // `;

    // const values = [user_id];

    // let results = await client.query(sql, values);
    let out = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const latest_bid = await exports.getLatestBid(product.id);

        out.push({
            id: product.id,
            name: product.name,
            image: product.image,
            winner: {
                id: product.user.id,
                name: product.user.name,
            },
            latest_bid: latest_bid,
        });
    }

    return out;
};

exports.sold = async (id) => {
    const solds = await Product.findAll({
        where: {
            status: 'selesai',
            user_id: id,
        },
        include: [
            {
                model: User,
                as: 'user',
                required: true,
            },
            {
                model: User,
                as: 'winner',
                required: false,
            }
        ]
    });
    // const sql = `
    // select
    //     p.*,
    //     u.id as winner_id,
    //     u.name as winner_name
    // from 
    //     products p,
    //     users u
    // where
    //     status = 'selesai' and
    //     p.winner_id = u.id and
    //     user_id = $1
    // order by
	//     p.end_date desc
    // `;

    // const values = [id];

    // let results = await client.query(sql, values);
    let out = [];

    for (let i = 0; i < solds.length; i++) {
        const sold = solds[i];

        const latest_bid = await exports.getLatestBid(sold.id);

        out.push({
            id: sold.id,
            name: sold.name,
            image: sold.image,
            winner: sold.winner && {
                id: sold.winner.id,
                name: sold.winner.name
            },
            latest_bid: latest_bid,
        });
    }

    // console.log(out)

    return out;
}

exports.batchAuctionEnd = async () => {
    // cari semua produk yang end_date nya di masa lalu dan status != null
    const products = await Product.findAll({
        where: {
            end_date: {
                [Op.lt]: Date.now(),
            },
            status: sequelize.literal(`status is distinct from 'selesai'`),
        }
    });

    for (let i = 0; i < products.length; i++) {
        let product = products[i];

        // cari pemenang
        const winner = await exports.bidWinner(product.id);

        if (winner) {
            await exports.endBid(product.id, winner.id);
        } else {
            await exports.endBid(product.id, null);
        }
    }
};
