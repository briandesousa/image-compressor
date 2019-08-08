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

function compressFile(file) {
  // TODO implement actual compression

  const compressedFileSize = Math.round(file.size / 3);
  const spaceSavings = (1 - (compressedFileSize / file.size)) * 100;

  return { 
    ...file,
    compressedFileName: `${file.filename}.compressed`,
    compressedFileSize: compressedFileSize,
    spaceSavings: spaceSavings
  };
}

router.post('/', upload.array('images'), function(req, res, next) {
  const fileUploadCount = req.files ? req.files.length : 0;
  debug(`Uploaded file count: ${fileUploadCount}`);

  if (fileUploadCount > 0) {
    debug(`Saving info for ${fileUploadCount} uploaded file(s) to in-memory session`);
    req.session.files = req.session.files || [];

    req.files.forEach(file => {
      req.session.files.push(compressFile(file));
    });

    debug(`Number of files in session after upload is ${req.session.files.length}`);
  }
  
  res.redirect('/');
});

router.get('/', function(req, res, next) {
  res.status(200).send(req.session.files || []);
});

module.exports = router;
