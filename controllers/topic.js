'use strict'

var validator = require('validator');
var Topic = require('../models/topic');


var controller = {
    test: function(req, res) {
        return res.status(200).send({
            message: 'Funcion de test'
        });
    },

    save: function(req, res) {
        //Recoger parametros por post
        var params = req.body;

        //Validar los datos
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
            var validateLang = !validator.isEmpty(params.lang);
        } catch(err){
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if(validateTitle && validateContent && validateLang) {
            //Crear objeto a guardar
            var topic = new Topic();

            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;

            //Guardar el topic
            topic.save((err, topicStored) => {

                if(err || !topicStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha guardado correctamente'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Se ha guardado el topic correctamente',
                    topic: topicStored
                });
            });

            
        } else {
            return res.status(200).send({
                message: 'Los datos no son válidos'
            });
        }
    }
};

module.exports = controller;