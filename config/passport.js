var passport = require('passport');
var User = require('../models/usermodel');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(usermodel, done) {
    done(null, usermodel.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, usermodel) {
        done(err, usermodel);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email':email}, function(err, usermodel) {
        if(err) {
            return done(err);
        }
        if(usermodel) {
            return done(null, false, {message: 'Email already taken'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
            if(err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email':email}, function(err, usermodel) {
        if(err) {
            return done(err);
        }
        if(!usermodel) {
            return done(null, false, {message: 'No user found'});
        }
        if(!usermodel.validPassword(password)) {
            return done(null, false, {message: 'Wrong password'});
        }
        return done(null, usermodel);
    });
}));
