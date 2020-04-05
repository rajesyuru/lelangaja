const express = require('express');
const path = require('path');
const dbUser = require('./db/user');
const dbProduct = require('./db/products');
const bodyParser = require('body-parser');
const {Buffer} = require('buffer');



const app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
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
    } else if (req.body.password.trim().length <= 8) {
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
