const dbUser = require('../../db/user');

exports.checkLogin = async (req, res) => {
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
    } else {
        res.send({
            status: 'error',
        });
    }
};