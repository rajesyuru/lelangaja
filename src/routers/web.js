const express = require('express');

const dbUser = require('../db/user');
const dbProduct = require('../db/products');
const dbAuctionHistories = require('../db/auction-histories');
const utilities = require('../utilities');

const router = express.Router();

router.get('/', (req, res) => {
    if (req.authUser) {
        res.redirect('/dashboard');
    } else {
        res.render('index');
    }
});

router.get('/dashboard', async (req, res) => {
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
});

router.get('/auction-room', async (req, res) => {
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
});

router.get('/followed-auctions', async (req, res) => {
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
});

router.get('/sold', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        let sold = await dbProduct.sold(id);

        res.render('sold', {
            sold: sold
        })
        
    } else {
        res.send({
            status: 'error',
        });
    }
});


router.get('/register', (req, res) => {
    if (req.authUser) {
        res.redirect('/dashboard');
    } else {
        res.render('register');    
    }
});

router.get('/edit-profile', (req, res) => {
    if (req.authUser) {
        res.render('edit-profile');
    } else {
        res.redirect('/');
    }
});

router.get('/users', (req, res) => {
    if (req.authUser) {
        res.render('users');
    } else {
        res.redirect('/');
    }
});

router.get('/add-product', (req, res) => {
    if (req.authUser) {
        res.render('add-product');
    } else {
        res.redirect('/');
    }
});

router.post('/register', async (req, res) => {
    if (req.body.name.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Nama mesti diisi'
        });
    } else if (req.body.email.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Email mesti diisi'
        });
    } else if (req.body.password.trim().length <= 7) {
        res.send({
            status: 'error',
            message: 'Password mesti lebih dari 8 karakter'
        });
    } else if (req.body.password2.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Password mesti diketik ulang'
        });
    } else if (req.body.password != req.body.password2) {
        res.send({
            status: 'error',
            message: 'Password yang anda masukkan tidak sama'
        });
    } else if (await dbUser.doesEmailExists(req.body.email)) {
        res.send({
            status: 'error',
            message: 'Email sudah pernah digunakan'
        });
    } else {
        const {name, email, password} = req.body;

        await dbUser.addUser({
            name: name,
            email: email,
            password: password
        });

        res.send({
            status: 'success'
        });
    }
});

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || email.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Email mesti diisi'
        });
    } else if (!password || password.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Password mesti diisi'
        });
    } else {
        let user = null;

        if ( email === 'admin@admin.com' && password === 'jakarta123' ) {
            user = {
                id: 'admin1234567890',
                email: 'admin@admin.com',
                name: 'Administrator',
                role: 'admin',
            };
        } else {
            user = await dbUser.login(email, password);
        }
        
        if (!user) {
            res.send({
                status: 'error',
                message: 'Email dan atau password yang anda masukan salah'
            });
        } else {
            res.setHeader('Set-Cookie', `id=${user.id}`);
            res.send({
                status: 'success'
            });
        }
    }
});

router.get('/reset-email', (req, res) => {
    res.clearCookie('id');

    res.render('passreset-email');
})

router.get('/reset-password', (req, res) => {
    if (req.authUser) {
        res.render('passreset');
    } else {
        res.redirect('/');
    }
})

router.post('/reset-email', async (req, res) => {
    const email = req.body.email;

    if (!email || email.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Email mesti diisi'
        });
    } else {
        let user = await dbUser.doesEmailExistsforReset(email);

        if (user) {
            res.send({
                status: 'error',
                message: 'Email tidak ditemukan'
            });
        } else {
            // console.log(user[0].id)
            res.setHeader('Set-Cookie', `id=${user.id}`);
            res.send({
                status: 'success'
            });          
        };
    };
});

router.post('/reset-password', async (req, res) => {
    if (req.authUser) {
       const id = req.authUser.id;

        const password = req.body.password;
        const password2 = req.body.password2;

        if (password.trim().length <= 7) {
            res.send({
                status: 'error',
                message: 'Password mesti lebih dari 8 karakter'
            });
        } else if (password2.trim().length === 0) {
            res.send({
                status: 'error',
                message: 'Password mesti diketik ulang'
            });
        } else if (password != password2) {
            res.send({
                status: 'error',
                message: 'Password yang anda masukkan tidak sama'
            });
        } else {
            let result = await dbUser.updateUser(id, {password: password});

            if (result) {
                res.clearCookie('id');
                res.send({
                    status: 'success',
                });
            } else {
                res.send({
                    status: 'error',
                    message: 'Gagal update user',
                });
            }
        }
    }

    res.send({
        status: 'error',
    });
    
});

router.get('/logout', (req, res) => {
    // 1) hapus cookies
    res.clearCookie('id');

    // 2) redirect ke halaman login
    res.redirect('/');
});

module.exports = router;