const express = require('express');
const router = express.Router();

router.get('/images', function(req, res, next) {
    // TODO
    res.send('list of images in session');
});

module.exports = router;