const express = require('express');

const dbUser = require('../db/user');
const dbProduct = require('../db/products');
const dbAuctionHistories = require('../db/auction-histories');

const router = express.Router();

router.post('/bid', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        const price = req.body.price;
        const product_id = req.body.product_id;

        const product = await dbProduct.get(product_id);

        if (!price) {
            res.send({
                status: 'error',
                message: 'Harga wajib diisi',
            });
        } else if (!product) {
            res.send({
                status: 'error',
                message: 'ID Produk tidak valid',
            });
        } else {
            await dbAuctionHistories.add(id, product_id, price);

            res.send({
                status: 'success',
            });
        }
    } else {
        res.send({
            status: 'error',
        });
    }
});

router.post('/end-bid', async (req, res) => {
    if (req.authUser) {
        const current_user = req.authUser.id;
        const product_id = req.body.product_id;

        let product = await dbProduct.get(product_id);
        if (!product) {
            res.send({
                status: 'error',
                message: 'ID produk tidak valid'
            })
        } else if (product.owner.id !== current_user) {
            res.send({
                status: 'error',
                message: 'Anda bukan pemilik produk ini'
            })
        } else {
            let bidWinner = await dbProduct.bidWinner(product_id);
            if (bidWinner !== null) {
                await dbProduct.endBid(product_id, bidWinner.winner_id);
                res.send({
                    status: 'success',
                })
            } else {
                await dbProduct.endBid(product_id, null);
                res.send({
                    status: 'success'
                })
            }
        };
    } else {
        res.send({
            status: 'error',
        });
    }
});

router.post('/add-product', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        await dbProduct.addProduct({
            id: id,
        }, {
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            multiplier: req.body.multiplier,
            end_date: req.body.end_date,
        });

        res.send({
            status: 'success',
        });
    } else {
        res.send({
            status: 'error',
        });
    }
});

router.get('/users', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        if (id === 'admin1234567890') {
            res.send({
                status: 'success',
                data: await dbUser.getAllUsers(),
            });
        } else {
            res.send({
                status: 'error',
                message: 'Anda bukan admin',
            });
        }
    } else {
        res.send({
            status: 'error',
            message: 'Anda harus login terlebih dahulu',
        });
    }
});

router.post('/edit-profile', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        if (req.body.name.trim().length === 0) {
            res.send({
                status: 'error',
                message: 'Nama mesti diisi'
            });
        }

        const name = req.body.name;

        let result = await dbUser.updateUser(id, {name: name});

        if (result) {
            res.send({
                status: 'success',
            });
        } else {
            res.send({
                status: 'error',
                message: 'Gagal update user',
            });
        }
    } else {
        res.send({
            status: 'error',
            message: 'Anda harus login terlebih dahulu',
        });
    }
});

router.get('/check-login', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        let user = null;

        if ( id === 'admin1234567890' ) {
            user = {
                id: 'admin1234567890',
                email: 'admin@admin.com',
                name: 'Administrator',
                role: 'admin',
            };
        } else {
            user = await dbUser.getUser(id);
        }

        if (user) {
            // jangan mengikutsertakan password
            delete user.password;

            res.send({
                status: 'success',
                user: user,
            });

            return;
        }
    }

    res.send({
        status: 'error',
    });
});

module.exports = router;