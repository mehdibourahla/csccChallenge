var Solution = require('../models/solution');
var User = require('../models/user');
var { check, validationResult } = require('express-validator');
var helper = {};

helper.getUserScore = function(userID){
    var score = 0;    
    Solution.find({author: userID},function(err,solutions){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{          
            solutions.forEach(function(solution){
                score+= solution.up.length - solution.down.length;
            });
            User.findById(userID,function(err,user){
                if(err){
                    req.flash("danger", err.name+" : "+err.message);
                    res.redirect("back");
                }
                else{
                    user.score = score;
                    user.save();  
                }
            });
        }
    }); 
}

helper.registerValidation = function(req,res){
    check('email', 'Please enter a valid email').isLength({min:6,max:64}).isEmail();
    check('password', 'Please enter a password between 8 and 16 characters').isLength({min:8,max:16});
    var errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("danger", errors);
        res.redirect("back");
    }
}

module.exports = helper;