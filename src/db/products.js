const uuid = require('uuid/v4');
const { Client } = require('pg');

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
