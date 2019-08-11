const express = require('express');
const router = express.Router();
const multer = require('multer')
const debug = require('debug')('image-compressor:upload');
const jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, global.appUploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileNameNoExt = path.basename(file.originalname, ext);

    // append timestamp to filename
    cb(null, `${fileNameNoExt}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: diskStorage })

// compress images, add to session and return file information object
function compressFile(file, boundingWidth, boundingHeight) {
  const ext = path.extname(file.path);
  const fileNameNoExt = path.basename(file.path, ext);
  const compressedFileName = `${fileNameNoExt}-compressed${ext}`;
  const compressedFilePath = path.join(file.destination, compressedFileName);

  return jimp.read(file.path)
    .then(image => {
      debug(`Compressing image to ${compressedFilePath}`);
      return image
        .scaleToFit(boundingWidth, boundingHeight)
        .writeAsync(compressedFilePath)
        .then(() => {
          const stats = fs.statSync(compressedFilePath);
          const compressedFileSize = stats.size;
          const spaceSavings = (1 - (compressedFileSize / file.size)) * 100;
          return new Promise(resolve => {
            resolve({
              ...file,
              compressedFileName: compressedFileName,
              compressedFileSize: compressedFileSize,
              compresssedFilePath: compressedFilePath,
              spaceSavings: spaceSavings,
              id: uuidv1()
            })
          });
        })
        .catch(err => {
          debug(`Failed to write ${compressedFilePath}`);
          throw err;
        })
    })
    .catch(err => {
      debug(`Failed to read ${file.path}`);
      throw err;
    });
}

// upload one or more images and compress
router.post('/', upload.array('images'), async (req, res) => {
  const fileUploadCount = req.files ? req.files.length : 0;
  debug(`Uploaded file count: ${fileUploadCount}`);

  if (fileUploadCount > 0) {
    debug(`Saving info for ${fileUploadCount} uploaded file(s) to in-memory session`);
    req.session.files = req.session.files || [];

    for (let file of req.files) {
      await compressFile(file, 1000, 1000)
        .then(compressedFile => req.session.files.push(compressedFile));
    }

    debug(`Number of files in session after upload is ${req.session.files.length}`);
  }
  
  res.redirect('/');
});

// return a list of all uploaded images in session
router.get('/', function(req, res, next) {
  res.status(200).send(req.session.files || []);
});

// return a specific image in session
router.get('/:uploadId', function(req, res) {
  const file = req.session.files.find(file => file.id === req.params.uploadId);
  if (file) {
    return res.sendFile(path.resolve(file.compresssedFilePath));
  }
  return res.status(404).send('upload not found');
});

module.exports = router;
