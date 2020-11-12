'use strict'

var validator = require('validator');

var Topic = require('../models/topic');

var controller = {
    add: function(req, res) {

        //Recoger el id del topic de la url
        var topicId = req.params.topicId;

        //Find por id del topic
        Topic.findById(topicId).exec((err, topic) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema'
                });
            }

            //Comprobar si el user esta identificado y validar datos
            if(req.body.content) {
                try {
                    var validateContent = !validator.isEmpty(req.body.content);
                } catch(err){
                    return res.status(200).send({
                        message: 'No has comentado nada'
                    });
                }

                if(validateContent){
                    
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    }
                    
                    //En la propiedad comments del objeto resultante hacer push
                    topic.comments.push(comment);

                    //Guardar el topic
                    topic.save((err) => {
                        if(err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario'
                            });
                        }
                        //Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            topic
                        });
                    });

                    
                } else {
                    return res.status(200).send({
                        message: 'No se han validado los datos del comentario'
                    });
                }
            }

        });

       
    },

    update: function(req, res) {
        return res.status(200).send({
            message: 'Metodo de updatear comentario'
        });
    },

    delete: function(req, res) {
        return res.status(200).send({
            message: 'Metodo de borrar comentario'
        });
    }
};

module.exports = controller;