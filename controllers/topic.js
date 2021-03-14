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

        
    },

    getTopicsByUser: function(req, res) {
        //Conseguir id de usuario
        var userId = req.params.user;

        //Find con una condición de usuario
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err) {
                //Devolver resultado
                return res.status(500).send({
                    message: 'Error en la petición'
                });
            }

            if(!topics) {
                //Devolver resultado
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                });
            }

            //Devolver resultado
            return res.status(200).send({
                status: 'success',
                topics
            });
        });

        
    },

    getTopic: function(req, res) {
        //Sacar el id del topic de la url
        var topicId = req.params.id;

        //Find por el id del topic
        Topic.findById(topicId)
             .populate('user')
             .populate('comments.user')
             .exec((err, topic) => {

                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if(!topic){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el tema'
                    });
                }

                //Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    topic
                });
             });
    },

    update: function(req, res) {
        //Recoger el id del topic de la url
        var topicId = req.params.id;

        //Recoger los datos que llegan desde post
        var params = req.body;

        //Validar datos
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
            //Montar un json con los datos modificables
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            //Find and update del topic por id y por id de usuario
            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdate) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if(!topicUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se ha actualizado el tema'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    topic: topicUpdate
                });
            });

            
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'La validación de los datos no es correcta'
            });
        }
    },

    delete: function(req, res) {
        //Sacar el id del topic de la URL
        var topicId = req.params.id;

        //Find and delte por topicId u por userId
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topicRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el tema'
                });
            }

            //Devolver una respuesta
            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        });
    },
    
    search: function(req, res) {
        //Sacar string a buscar
        var searchString = req.params.search;
        //Find con OR
        Topic.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"} },
            { "content": { "$regex": searchString, "$options": "i"} },
            { "code": { "$regex": searchString, "$options": "i"} },
            { "lang": { "$regex": searchString, "$options": "i"} }
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: "No hay temas disponibles"
                });
            }

            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    }
};

module.exports = controller;