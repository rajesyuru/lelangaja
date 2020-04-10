const uuid = require('uuid/v4');
const { Client } = require('pg');
const moment = require('moment');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:jakarta123@localhost:5432/lelangaja'
;

const client = new Client({
    connectionString: connectionString,
});

client.connect();

exports.addProduct = async (user, product) => {
    product.id = uuid();

    const sql = 'insert into products (id, user_id, name, image, description, multiplier, end_date) values ($1, $2, $3, $4, $5, $6, $7)';

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
	p.user_id = u.id and 
	end_date > now() 
    `;

    let results = await client.query(sql);

    return results.rows.map(row => {
        return {
            id: row.id,
            name: row.name,
            multiplier: row.multiplier,
            image: row.image,
            description: row.description,
            end_date: moment(row.end_date),
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
            },
        };
    });
};

exports.get = async (id) => {
    const sql = `
    select
        *
    from
        products
    where
        id = $1
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
            end_date: moment(row.end_date),
        };
    } else {
        return false;
    }
}
