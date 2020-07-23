'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

//Modelo de COMMENT
var commentSchema = schema({
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: schema.ObjectId, ref: 'User' }
});

var comment = mongoose.model('Comment', commentSchema);

//Modelo de TOPIC
var topicSchema = schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: { type: Date, default: Date.now },
    user: { type: schema.ObjectId, ref: 'User'},
    comments: [commentSchema]
});

module.exports = mongoose.model('Topic', topicSchema);