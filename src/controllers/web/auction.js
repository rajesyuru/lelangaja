const dbProduct = require('../../db/products');
const dbAuctionHistories = require('../../db/auction-histories');
const utilities = require('../../utilities');

exports.auctionRoom = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;
        const product_id = req.query.id;

        const product = await dbProduct.get(product_id);
        if (product) {
            let histories = await dbAuctionHistories.getAuctions(product_id);

            const latestBid = await dbProduct.getLatestBid(product_id);
            const bidPrice = latestBid + product.multiplier;

            const bidWinner = await dbProduct.bidWinner(product_id);

            // console.log(product.status);

            res.render('auction-room', {
                me_id: id,
                histories: histories,
                product: product,
                bidPrice: bidPrice,
                bidWinner: bidWinner,
                formatPrice: utilities.formatPrice,
            });
        } else {
            res.send('Not found');
        }
    } else {
        res.send('Not found');
    }
};

exports.followedAuction = async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        let wonBids = await dbProduct.wonBid(id);

        res.render('followed-auctions', {
            wonBids: wonBids
        })
    } else {
        res.send({
            status: 'error',
        });
    }
}

exports.sold = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;

        let sold = await dbProduct.sold(id);

        // sold.forEach(solded => {
        //     console.log(`
        //     This item is won by ${solded.winner.name}
        //     `)
        // })

        res.render('sold', {
            seller_id: id,
            sold: sold
        })
        
    } else {
        res.send({
            status: 'error',
        });
    }
};

exports.addProduct = (req, res) => {
    if (req.authUser) {
        res.render('add-product');
    } else {
        res.redirect('/');
    }
};