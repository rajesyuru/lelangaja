const express = require('express');

const auctionController = require('../controllers/api/auction');
const userController = require('../controllers/api/user');
const authController = require('../controllers/api/auth');
const notificationController = require('../controllers/api/notification')

const router = express.Router();

router.post('/bid', auctionController.bid);
router.post('/end-bid', auctionController.endBid);
router.post('/add-product', auctionController.addProduct);

router.get('/users', userController.fetch);
router.post('/edit-profile', userController.editProfile);

router.post('/read-all-notifications', notificationController.readAllNotifications)

router.get('/check-login', authController.checkLogin);

module.exports = router;