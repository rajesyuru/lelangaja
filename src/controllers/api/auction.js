const dbUser = require('../../db/user');
const dbProduct = require('../../db/products');
const dbAuctionHistories = require('../../db/auction-histories');

exports.bid = async (req, res) => {
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
};

exports.endBid = async (req, res) => {
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
};

exports.addProduct = async (req, res) => {
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
}