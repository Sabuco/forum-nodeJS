'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
var mdAuth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var mdUpload = multipart({ uploadDir: './uploads/users' });

//Rutas de prueba
router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);

//Rutas de usuarios
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', mdAuth.authenticated, UserController.update);
router.post('/upload-avatar/:id', [mdAuth.authenticated, mdUpload], UserController.uploadAvatar);

module.exports = router;