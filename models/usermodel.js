var mongoose = require('mongoose');
var db = require('mongodb');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;

var UserSchema = new schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
});

UserSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

