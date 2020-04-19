const dbUser = require('../../db/user');

exports.fetch = async (req, res) => {
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
};

exports.editProfile = async (req, res) => {
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
};