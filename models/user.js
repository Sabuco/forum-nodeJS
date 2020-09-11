'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userSchema = schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

userSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;

    return obj;
}

module.exports = mongoose.model('User', userSchema);