const express = require('express');
const router = express.Router();
const multer = require('multer')
const debug = require('debug')('image-compressor:upload');

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, global.appUploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`)
  }
});

const upload = multer({ storage: diskStorage })

function saveToSession(files) {
  debug(`Saving info for ${files.length} uploaded file(s) to in-memory session`);
}

router.post('/', upload.array('images'), function(req, res, next) {
  const fileUploadCount = req.files ? req.files.length : 0;
  debug(`Uploaded file count: ${fileUploadCount}`);

  if (fileUploadCount > 0) {
    saveToSession(req.files);
  }
  
  res.redirect('/');
});

router.get('/', function(req, res, next) {
  // TODO
  res.send('respond with an image');
});

module.exports = router;
