const express = require('express');
const path = require('path');
const dbUser = require('./db/user');
const dbProduct = require('./db/products');
const bodyParser = require('body-parser');
const dbAuctionHistories = require('./db/auction-histories');
const utilities = require('./utilities');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/dashboard', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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

app.get('/auction-room', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];
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

app.post('/api/bid', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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

app.post('/api/end-bid', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const current_user = req.headers.cookie.split('=')[1];
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
                res.send({
                    status: 'error'
                })
            }
        };
    } else {
        res.send({
            status: 'error',
        });
    }
});

app.get('/followed-auctions', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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

app.get('/sold', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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


app.get('/register', (req, res) => {

    res.render('register');
});

app.get('/edit-profile', (req, res) => {
    res.render('edit-profile');
});

app.get('/users', (req, res) => {
    res.render('users');
});

app.get('/add-product', (req, res) => {
    res.render('add-product');
});

app.post('/api/add-product', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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


app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
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

app.get('/reset-email', (req, res) => {
    res.clearCookie('id');

    res.render('passreset-email');
})

app.get('/reset-password', (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        res.render('passreset');
    } else {
        res.redirect('/');
    }
})

app.post('/reset-email', async (req, res) => {
    const email = req.body.email;

    if (!email || email.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Email mesti diisi'
        });
    } else {
        let user = await dbUser.doesEmailExistsforReset(email);

        if (user.length === 0) {
            res.send({
                status: 'error',
                message: 'Email tidak ditemukan'
            });
        } else {
            // console.log(user[0].id)
            res.setHeader('Set-Cookie', `id=${user[0].id}`);
            res.send({
                status: 'success'
            });          
        };
    };
});

app.post('/reset-password', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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

app.get('/check-login', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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



app.get('/logout', (req, res) => {
    // 1) hapus cookies
    res.clearCookie('id');

    // 2) redirect ke halaman login
    res.redirect('/');
});

app.post('/edit-profile', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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


app.get('/api/users', async (req, res) => {
    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
