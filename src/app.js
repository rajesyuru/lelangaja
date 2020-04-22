const express = require('express');
const path = require('path');
const dbProduct = require('./db/products');
const bodyParser = require('body-parser');

const routers = require('./routers');

const {sequelize, Wishlist} = require('./models');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json());

setInterval(() => {
    dbProduct.batchAuctionEnd();
 }, 60*1000);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(routers);

const port = process.env.PORT || 3000;

sequelize.sync()
    .then(() => {
        console.log('Database berhasil di sync');

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(error => console.warn(error));
