'use strict'

var secret = "secret-key-token-2134";
var jwt = require('jwt-simple');
var moment = require('moment');


exports.authenticated = function(req, res, next) {

    //Comprobar si llega autorización
    if(!req.headers.authorization) {
        return res.status(403).send({
            message: 'La petición no tiene la cabezera de authorization'
        });
    }

    //Limpiar token
    var token = req.headers.authorization.replace(/['"]+/g, '');

    //Decodificar token
    try {
        var payload = jwt.decode(token, secret);
        
        //Comprobar exp
        if(payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'El token no es válido'
            });
        }

    } catch(ex) {
        return res.status(404).send({
            message: 'El token no es válido'
        });
    }

    //Adjuntar usuario identificado a request
    req.user = payload;

    //Pasar a la acción
    next();
}