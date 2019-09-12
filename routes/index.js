var express = require('express');
var router = express.Router({mergeParams: true});
var User = require('../models/user');
var passport = require('passport');
var middleware = require('../middleware');
var { validationResult } = require('express-validator');

router.get("/",function(req,res){
    res.redirect("/challenges");
});

router.get("/register",middleware.canLog,function(req,res){
    res.render("register");
});

router.post("/register",middleware.canLog, middleware.checkRegister ,function(req,res){
    var Result = validationResult(req);
    if(!Result.isEmpty()){
        req.flash("danger", Result.errors[0].msg);
        res.redirect("back");
    }
    else{
        User.register(new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email
            }), req.body.password,function(err,user){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            passport.authenticate("local")(req,res,function(){
                req.flash("success", "Welcome "+req.user.username+" You have signed up succefully");
                res.redirect("/login");
            });   
        });
    }
    
});

router.get("/login",middleware.canLog,function(req,res){
    res.render("login");
});

router.post('/login',middleware.canLog,passport.authenticate("local",{
    successRedirect: "/challenges",
 	failureRedirect: "/login"
}),function(req,res){
});

router.get("/logout",middleware.isLoggedIn,function(req,res){
    req.logout(); 
    req.flash("success", "Succefully logged you out, Have a good day!");
    res.redirect('/challenges');
});

module.exports = router;