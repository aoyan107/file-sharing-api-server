const express = require('express');
const FileController = require('../controllers/FileController');

const router = express.Router();

const fileController = new FileController();
const rateLimit = require('../middlewares/rateLimit');

router.post('/', rateLimit('upload'), fileController.postFile);
router.get('/:publicKey', rateLimit('download'), fileController.getFile);
router.delete('/:privateKey', fileController.deleteFile);

module.exports = router;
