const express = require('express');

const apiRouter = require('./api');
const webRouter = require('./web');

const router = express.Router();

// middleware untuk check cookie
router.use((req, res, next) => {
    req.authUser = null;

    if (req.headers.cookie && req.headers.cookie.trim().length > 0) {
        const id = req.headers.cookie.split('=')[1];

        req.authUser = {id: id*1};
    }

    next();
});

router.use(webRouter);
router.use('/api', apiRouter);

// 404 not found
router.use((req, res) => {
    res.render('404');
});

module.exports = router;
