const { User } = require('../models');

exports.addUser = async (user) => {
    await User.create({
       name: user.name,
       email: user.email,
       password: user.password 
    });
};

exports.doesEmailExists = async (email) => {
    const user = await User.findOne({
        where: {
            email: email,
        },
    });

    return !user ? false : true;
};

exports.doesEmailExistsforReset = async (email) => {
    const user = await User.findOne({
        where: {
            email: email
        }
    });
    // const sql = 'select * from users where email = $1';
    // const values = [email];
    // let results = await client.query(sql, values);

    return user;
};

exports.login = async (email, password) => {
    const user = await User.findOne({
        where: {
            email: email,
            password: password,
        }
    });

    if (user) {
        return user;
    } else {
        return false;
    };
};

exports.getUser = async (id) => {
    const user = await User.findByPk(id);

    if (user) {
        return user;
    } else {
        return undefined;
    };
};

exports.updateUser = async (id, {name, email, password}) => {
    const user = await exports.getUser(id);

    if ( user ) {
        if ( name ) {
            user.name = name;
        }

        if ( email ) {
            user.email = email;
        }

        if ( password ) {
            user.password = password;
        }

        user.save();

        return true;
    } else {
        return false;
    };
};

exports.getAllUsers = async () => {
    return users = await User.findAll();
};