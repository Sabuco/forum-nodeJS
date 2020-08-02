'use strict'

var validator = require('validator');
var Topic = require('../models/topic');
const topic = require('../models/topic');


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
            topic.user = req.user.sub;

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
    },

    getTopics: function(req, res) {

        //Cargar la libreria de paginacion

        //Recoger la pagina actual
        if (!req.params.page 
            || req.params.page == 0 
            || req.params.page == "0" 
            || req.params.page == null
            || req.params.page == undefined) {
                var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }
        

        //Indicar las opciones de paginación
        var options = {
            sort: { date: -1},
            populate: 'user',
            limit: 5,
            page: page
        };

        //Encontrar topics paginados
        Topic.paginate({}, options, (err, topics) => {

            if(err){
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al hacer la consulta'
                });
            }

            if(!topics) {
                return res.status(404).send({
                    status: 'Not Found',
                    message: 'No hay topics'
                });
            }
            //Devolver resultado (topics,total de topics, total de paginas)
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });

        
    }
};

module.exports = controller;