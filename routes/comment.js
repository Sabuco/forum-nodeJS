'use strict'

var express = require('express');
var CommentController = require('../controllers/comment');

var router = express.Router();
var mdAuth = require('../middlewares/authenticated');

router.post('/comment/topic/:topicId', mdAuth.authenticated, CommentController.add);
router.put('/comment/:commentId', mdAuth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', mdAuth.authenticated, CommentController.delete);

module.exports = router;