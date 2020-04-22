const express = require('express');

const authController = require('../controllers/web/auth');
const dashboardController = require('../controllers/web/dashboard');
const userController = require('../controllers/web/user');
const auctionController = require('../controllers/web/auction');

const router = express.Router();

router.get('/', authController.getLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/dashboard', dashboardController.index);

router.get('/edit-profile', userController.editProfile);
router.get('/users', userController.list);
router.get('/reset-email', userController.getEmailReset);
router.get('/reset-password', userController.getPassReset);
router.post('/reset-email', userController.emailReset);
router.post('/reset-password', userController.passReset);

router.get('/add-product', auctionController.addProduct);
router.get('/followed-auctions', auctionController.followedAuction);
router.get('/auction-room', auctionController.auctionRoom);
router.get('/sold', auctionController.sold);

module.exports = router;