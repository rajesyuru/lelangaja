const uuid = require('uuid/v4');
const { Client } = require('pg');
const moment = require('moment-timezone');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:jakarta123@localhost:5432/lelangaja'
;

const client = new Client({
    connectionString: connectionString,
});

client.connect();

exports.addProduct = async (user, product) => {
    product.id = uuid();

    const sql = `insert into products (id, user_id, name, image, description, multiplier, end_date, status, winner_id) values ($1, $2, $3, $4, $5, $6, $7, 'belum selesai', '')`;

    const values = [
        product.id,
        user.id,
        product.name,
        product.image,
        product.description,
        product.multiplier,
        product.end_date
    ];

    await client.query(sql, values);
};

exports.activeProducts = async () => {
    const sql = `
select
    p.*,
    u.id as user_id,
    u.name as user_name,
    u.email as user_email
from 
	products p,
	users u
where
    p.user_id = u.id
order by
    p.end_date desc
    `;

    let results = await client.query(sql);
    let out = [];

    for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows[i];

        const latest_bid = await exports.getLatestBid(row.id);

        out.push({
            id: row.id,
            name: row.name,
            multiplier: row.multiplier,
            image: row.image,
            description: row.description,
            end_date: moment.tz(row.end_date, 'Asia/Jakarta'),
            status: row.status,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
            },
            latest_bid: latest_bid,
        });
    }

    return out;
};

exports.get = async (id) => {
    const sql = `
    select
        p.*,
        u.name as owner_name,
        u.id as owner_id
    from
        products p,
        users u
    where
        u.id = p.user_id and
        p.id = $1
    `;

    const values = [id];

    let results = await client.query(sql, values);

    if (results.rows.length > 0) {
        let row = results.rows[0];

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            image: row.image,
            multiplier: row.multiplier,
            end_date: moment.tz(row.end_date, 'Asia/Jakarta'),
            owner: {
                id: row.owner_id,
                name: row.owner_name,
            },
            status: row.status
        };
    } else {
        return false;
    }
}

exports.getLatestBid = async (id) => {
    const sql = `
select 
	price
from 
	auction_histories ah 
where
	product_id = $1
order by
	created_at desc 
    `;

    const values = [id];

    let results = await client.query(sql, values);

    if (results.rows.length > 0) {
        return results.rows[0].price;
    } else {
        return 0;
    }
};



exports.bidWinner = async (id) => {
    const sql = `
    select
        h.*,
        u.id,
        u.name as user_name
    from
        auction_histories h,
        users u
    where
        product_id = $1 and
        h.user_id = u.id
    order by
	    created_at desc
    `;

    const values = [id];

    let results = await client.query(sql, values);

    if (results.rows.length > 0) {
        let row = results.rows[0];

        return {
            winner_id: row.user_id,
            winner_name: row.user_name,
            product_id: row.product_id,
            price: row.price
        };

    } else {
        return null;
    }
};

exports.endBid = async (id, winner_id) => {
    const sql = `
    update
        products
    set
        end_date = now(),
        status = $1,
        winner_id = $2
    where
        id = $3
    `;

    let values = ['selesai', winner_id, id];

    await client.query(sql, values);
}

exports.wonBid = async (user_id) => {
    const sql = `
    select
        *
    from
        products
    where
        status = 'selesai' and
        winner_id = $1
    order by
	    end_date desc
    `;

    const values = [user_id];

    let results = await client.query(sql, values);
    let out = [];

    for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows[i];

        const latest_bid = await exports.getLatestBid(row.id);

        out.push({
            id: row.id,
            name: row.name,
            image: row.image,
            winner: {
                id: row.user_id,
                name: row.user_name,
            },
            latest_bid: latest_bid,
        });
    }

    return out;
};

exports.sold = async (id) => {
    const sql = `
    select
        p.*,
        u.id as winner_id,
        u.name as winner_name
    from 
        products p,
        users u
    where
        status = 'selesai' and
        p.winner_id = u.id and
        user_id = $1
    order by
	    p.end_date desc
    `;

    const values = [id];

    let results = await client.query(sql, values);
    let out = [];

    for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows[i];

        const latest_bid = await exports.getLatestBid(row.id);

        out.push({
            id: row.id,
            name: row.name,
            image: row.image,
            winner: {
                id: row.winner_id,
                name: row.winner_name,
            },
            latest_bid: latest_bid,
        });
    }

    return out;
}