var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String,
    score: {type: Number, default: 0},
    created: {type: Date, default: Date.now}
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);