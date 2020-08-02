'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');

var router = express.Router();
var mdAuth = require('../middlewares/authenticated');

router.get('/test', TopicController.test);
router.post('/topic', mdAuth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);

module.exports = router;