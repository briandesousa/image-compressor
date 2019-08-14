var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    uploadedFiles: req.session.files || [],
    lastTiming: req.session.lastTiming || -1
  });
});

module.exports = router;
