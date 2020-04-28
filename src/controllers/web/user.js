const dbUser = require('../../db/user');
const notificationController = require('../api/notification');

exports.list = (req, res) => {
    if (req.authUser) {
        res.render('users');
    } else {
        res.redirect('/');
    }
};

exports.editProfile = async (req, res) => {
    if (req.authUser) {
        res.render('edit-profile', {
            notifications: await notificationController.notifications(req.authUser.id)
        });
    } else {
        res.redirect('/');
    }
};

exports.getEmailReset = (req, res) => {
    res.clearCookie('id');

    res.render('passreset-email');
};

exports.getPassReset = (req, res) => {
    if (req.authUser) {
        res.render('passreset');
    } else {
        res.redirect('/');
    }
};

exports.emailReset = async (req, res) => {
    const email = req.body.email;

    if (!email || email.trim().length === 0) {
        res.send({
            status: 'error',
            message: 'Email mesti diisi'
        });
    } else {
        let user = await dbUser.doesEmailExistsforReset(email);

        if (!user) {
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
};

exports.passReset = async (req, res) => {
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
    
};

exports.messages = async (req, res) => {
    if (req.authUser) {
        res.render('messages', {
            notifications: await notificationController.notifications(req.authUser.id)
        })
    } else {
        res.redirect('/')
    };
};