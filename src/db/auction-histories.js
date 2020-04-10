const uuid = require('uuid/v4');
const { Client } = require('pg');
const moment = require('moment');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:jakarta123@localhost:5432/lelangaja'
;
const client = new Client({
    connectionString: connectionString,
});

client.connect();

exports.getAuctions = async (product_id) => {
    const sql = `
select
    ah.*,
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    p.id as product_id,
    p.name as product_name,
    p.description as product_description,
    p.image as product_image,
    p.multiplier as product_multiplier,
    p.end_date as product_end_date
from
    auction_histories ah,
    users u,
    products p
where
    ah.user_id = u.id and
    ah.product_id = p.id and
    ah.product_id = $1
    `;

    const values = [product_id];

    let results = await client.query(sql, values);

    return results.rows.map(row => {
        return {
            id: row.id,
            price: row.price,
            created_at: moment(row.created_at),
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
            },
            product: {
                id: row.product_id,
                name: row.product_name,
                description: row.product_description,
                image: row.product_image,
                multiplier: row.product_multiplier,
                end_date: moment(row.product_end_date),
            },
        };
    });
};