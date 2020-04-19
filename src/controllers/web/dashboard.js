const dbProduct = require('../../db/products');
const utilities = require('../../utilities');

exports.index = async (req, res) => {
    if (req.authUser) {
        const id = req.authUser.id;

        let products = await dbProduct.activeProducts();

        res.render('dashboard', {
            products: products,
            logged_in_id: id,
            formatPrice: utilities.formatPrice,
        });
    } else {
        // redirect ke hal login
        res.redirect('/');
    }
};