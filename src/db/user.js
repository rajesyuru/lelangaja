const {LocalStorage} = require('node-localstorage');
const path = require('path');
const uuid = require('uuid/v4');

const localStorage = new LocalStorage(path.join(__dirname, '../../storage'));

getUsers = () => {
    let strStorage = localStorage.getItem('users');

    let users = null;
    if (strStorage !== null && strStorage.trim().length > 0) {
        users = JSON.parse(strStorage);
    }

    if (users === null) {
        users = [];

        saveUsers(users);
    }

    return users;
};

saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
};

exports.addUser = (user) => {
    let users = getUsers();

    user.id = uuid();

    users.push(user);

    saveUsers(users);
};

exports.doesEmailExists = (email) => {
    let users = getUsers();

    return users.findIndex(user => user.email === email) >= 0;
};

exports.login = (email, password) => {
    let users = getUsers();

    return users.find(user => user.email === email && user.password === password);
};

exports.getUser = (id) => {
    let users = getUsers();

    return users.find(user => user.id === id);
};