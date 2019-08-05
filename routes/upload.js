var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  // receive image to be uploaded
  res.send('respond with a GUID for the uploaded image');
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with an image');
});

module.exports = router;
