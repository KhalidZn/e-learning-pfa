var passport=require('passport');
var User=require('../models/user');
var Formation=require('../models/formation');
var Message=require('../models/message');

var localStrategy=require('passport-local').Strategy;

passport.serializeUser(function (user,done) {
    done(null,user.id);
});

passport.deserializeUser(function (id,done) {
    User.findById(id,function (err,user) {
        done(err,user);
    });
});

passport.use('local.signup',new localStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function (req,email,password,done) {
    req.checkBody('email','Invalid email, please enter a valid email').notEmpty().isEmail();
    req.checkBody('firstName','Please enter you first name').notEmpty();
    req.checkBody('lastName','Please enter you last name').notEmpty();
    req.checkBody('password','Invalid password, must contain 5 characters at least').notEmpty().isLength({min:5});
    var errors=req.validationErrors();
    if(errors){
        var messages=[];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null,false,req.flash('error',messages));
    }

    User.findOne({'email':email},function (err,user) {
        if(err){
            return done(err);
        }
        if (user){
            return done(null,false,{message:'Sorry that email is already in use .'});
        }
        var newUser=new User();
        newUser.email=email;
        newUser.name.first=req.body.firstName;
        newUser.name.last=req.body.lastName;
        newUser.type=req.body.type,
        newUser.password=newUser.encryptPassword(password);
        newUser.save(function (err,result) {
            if(err){
                return done(err);
            }
            if(newUser.type=="former"){
                var message=new Message({
                    from:"E-Learning Administration",
                    to:newUser,
                    object:"Welcome to E-Learning",
                    content:"Welcome "+newUser.name.last+" "+newUser.name.first+", we're glad to have you as former with us "+
                        "Feel free to add new courses and help us make e-learning greater. "+
                        "In order to do so: click the add formation button in your profile, a form will pop up and you'll be asked to fill out" +
                    " details about the course you want to add,"+
                    "the vId is the id of the video in youtube you want to import (last characters after of the url '?v=vId')"+
                        "You can always contact us if you have a wonder or need help Enjoy your stay and again we're happy to have you here"
                });
                message.save(function (err,success) {
                    if(err){
                        console.log("error adding the message")
                    }else
                        return done(null,newUser);
                })
            }
            if(newUser.type=="student"){
                var message=new Message({
                    from:"E-Learning Administration",
                    to:newUser,
                    object:"Welcome to E-Learning",
                    content:"Welcome "+newUser.name.last+" "+newUser.name.first+", we're glad to have you with us"+
                    " Feel free to browse our courses, follow them and join the open discussion :D"+
                    "You can always contact us if you have a wonder or need help. Enjoy your stay and again we're happy to have you here"
                });
                message.save(function (err,success) {
                    if(err){
                        console.log("error adding the message")
                    }else
                        return done(null,newUser);
                });
            }
            //return done(null,newUser);
        })
    });
    }

));


passport.use('local.signin',new localStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function (req,email,password,done) {
    req.checkBody('email','Invalid email, please enter a valid email').notEmpty().isEmail();
    req.checkBody('password','Invalid password, must contain 5 characters at least').notEmpty();
    var errors=req.validationErrors();
    if(errors){
        var messages=[];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null,false,req.flash('error',messages));
    }

    User.findOne({'email':email},function (err,user) {
        if(err){
            return done(err);
        }
        if (!user){
            return done(null,false,{message:"Sorry no user found matching your credentials, please try again "});
        }
        if(!user.validPassword(password)){
            return done(null,false,{message:"Wrong email or password, please try again"});
        }
        return done(null,user);
    });
}));