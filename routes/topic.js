'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');

var router = express.Router();
var mdAuth = require('../middlewares/authenticated');

router.get('/test', TopicController.test);
router.post('/topic', mdAuth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', mdAuth.authenticated, TopicController.update);
router.delete('/topic/:id', mdAuth.authenticated, TopicController.delete);

module.exports = router;