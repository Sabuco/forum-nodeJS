'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {

    probando: function(req, res){
        return res.status(200).send({
            message: "soy el metodo probando"
        });
    },

    testeando: function(req, res){
        return res.status(200).send({
            message: "Soy el metodo testeando"
        });
    },

    save: function(req, res){
        //Recoger los parametros de la petición
        var params = req.body;

        try {
            //Validar los datos
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch(err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if(validate_name && validate_surname && validate_email && validate_password){
            //Crear objeto de usuario
            var user = new User();

            //Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobar si el ususario existe
            User.findOne({email: user.email}, (err, issetUser) => {
                if(err) {
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad de usuario",
                    });
                }

                if(!issetUser) {
                    //Si no existe, cifrar contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        //Guardar usuario
                        user.save((err, userStored) => {
                            if(err) {
                                return res.status(500).send({
                                    message: "Error al guardar el usuario",
                                });
                            }

                            if(!userStored) {
                                return res.status(400).send({
                                    message: "El usuario no se ha guardado",
                                });
                            }
                            //Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });
                        }); //Cerramos save
                    }); //Cerramos bcrypt

                } else {
                    return res.status(500).send({
                        message: "El usuario ya está registrado",
                    });
                }
            });
            
        } else {
            return res.status(400).send({
                message: "Validación de los datos del usuario incorrecta, inténtalo de nuevo",
            });
        }
    },

    login: function(req, res){
        //Recoger parametros de la peticion
        var params = req.body;

        try {
            //Validar los datos
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch(err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if(!validate_email || !validate_password) {
            return res.status(400).send({
                message: 'Los datos son incorrectos'
            });
        }

        //Buscar usuarios que coincidan con el mail
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {
            //Si lo encuentra,
            if(err) {
                return res.status(500).send({
                    message: 'Error al intentar identificarse'
                });
            }

            if(!user) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }

            //Comprobar la contraseña
            bcrypt.compare(params.password, user.password, (err, isLogged) => {

                if(isLogged) {
                    //Generar token de JWT y devolverlo
                    if(params.getToken) {

                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });

                    } else {
                        //Limpiar objeto
                        user.password = undefined;

                        //Devolver datos
                        return res.status(200).send({
                            status: 'success',
                            user
                        });
                    }

                } else {

                    return res.status(200).send({
                        message: "Las credenciales no son correctas"
                    });
                    
                }
            });
        });

        
    },

    update: function(req, res) {
        //Recoger datos del usuario
        var params = req.body;

        try{
            //Validar los datos
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch(err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }


        //Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub;
        
        //Comprobar si el email es unico
        if(req.user.email != params.email) {
            User.findOne({email: params.email.toLowerCase()}, (err, user) => {
                //Si lo encuentra,
                if(err) {
                    return res.status(500).send({
                        message: 'Error al intentar identificarse'
                    });
                }
    
                if(user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email no puede ser modificado'
                    });
                } else {
                    //Buscar y actualizar documento
                    User.findOneAndUpdate({_id: userId}, params, {new:true}, (err, userUpdated) => {

                        if(err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar usuario'
                            });
                        }

                        if (!userUpdated) {
                            return res.status(200).send({
                                status: 'error',
                                message: 'No se ha actualizado el usuario'
                            });
                        }

                        //Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdated
                        });
                    });
                }
            });
        } else {

            //Buscar y actualizar documento
            User.findOneAndUpdate({_id: userId}, params, {new:true}, (err, userUpdated) => {

                if(err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }

                if (!userUpdated) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'No se ha actualizado el usuario'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
            });

        }
    },

    uploadAvatar: function(req, res) {
        //Recoger el fichero de la petición
        var fileName = 'Avatar no subido...';

        if(!req.files) {
            return res.status(404).send({
                status: 'error',
                message: fileName
            });
        }

        //Conseguir el nombre y la extension del archivo
        var filePath = req.files.file0.path;
        var fileSplit = filePath.split('\\');

        //Nombre del archivo
        var fileName = fileSplit[2];

        //Extension del archivo
        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];

        //Comprobar la extensión (solo imagenes), si no es valida borrar el fichero subido
        if(fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif') {
            fs.unlink(filePath, () => {
                return res.status(500).send({
                    status: 'error',
                    message: 'La extension del archivo no es válida',
                    file: fileSplit
                });
            });
        } else {
            //Sacar el id del usuario identificado
            var userId = req.user.sub;

            //Buscar documento bd
            User.findOneAndUpdate({_id: userId}, {image: fileName}, {new:true}, 
                (err, userUpdated) => {
                    if(err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar el usuario'
                        });
                    }
                    //Devolver respuesta
                    return res.status(200).send({
                        status: 'success',
                        user: userUpdated
                    });
            });

            
        }
    },

    avatar: function(req, res) {
        var fileName = req.params.fileName; 
        var pathFile = './uploads/users/' + fileName;

        fs.exists(pathFile, (exists) => {
            if(exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    message: 'La image no existe'
                });
            }
        });
    },

    getUsers: function(req, res) {
        User.find().exec((err, users) => {
            if(err || !users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function(req, res) {
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if(err || !user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }
};

module.exports = controller;