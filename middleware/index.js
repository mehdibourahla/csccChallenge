var Challenge = require('../models/challenge');
var Solution = require('../models/solution');
var { check } = require('express-validator');
var middlewareObj = {};


middlewareObj.checkRegister = [
    check().not().isEmpty().withMessage('All fields are required'),
    check('username').isLength({max:20 }).withMessage('Username must be under 20 chars'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars long')
  ]
middlewareObj.checkChallenge = [
    check('challenge[title]').not().isEmpty().withMessage('All fields with * are required'),
    check('challenge[type]').not().isEmpty().withMessage('All fields with * are required'),
    check('challenge[description]').not().isEmpty().withMessage('All fields with * are required')
]
middlewareObj.checkSolution = [
    check().not().isEmpty().withMessage('You must enter a solution!')
]

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }
    else{
        req.flash("danger","You need to be logged in first!");
        res.redirect("/login");
    }
}

middlewareObj.canLog = function(req,res,next){
    if(!req.isAuthenticated()){
        next();
    }
    else{
        req.flash("danger","You're not allowed to do that, Log out first!");
        res.redirect('/challenges');
    }
}

middlewareObj.checkChallengeOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Challenge.findById(req.params.id,function(err,challenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                if(challenge.author.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("danger", "You're not allowed to do that, you don't owe that challenge");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("danger", "You're not allowed to do that, you must be logged in first");
        res.redirect('/login');
    }
}

//checkSolutionOwnership Middleware
middlewareObj.checkSolutionOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Solution.findById(req.params.id,function(err,solution){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                if(solution.author.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("danger", "You're not allowed to do that, you don't owe that solution");
                    res.redirect('back');
                }
            }
        })
    }
    else{
        req.flash("danger", "You're not allowed to do that, you must be logged in first");
        res.redirect('/login');
    }
}

//canSeeSolutions Middleware
middlewareObj.canSeeSolutions = function(req,res,next){
    if(req.isAuthenticated()){
        Challenge.findById(req.params.challengeID).populate('solutions').exec(function(err,challenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                if(challenge.solutions.filter(solution => solution.author.equals(req.user._id)).length>0){
                    next();
                }
                else{
                    req.flash("warning", "You have to post a solution first to see other solutions");
                    res.redirect('back');
                }
            }
        });
    }
    else{
        req.flash("danger", "You're not allowed to do that, you must be logged in first");
        res.redirect('/login');
    }
}

middlewareObj.canDown = function(req,res,next){
    if(req.isAuthenticated()){
        Challenge.findById(req.params.challengeID).populate('solutions').exec(function(err,challenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                if(challenge.solutions.filter(solution => solution.author.equals(req.user._id)).length>0){
                    Solution.findById(req.params.id,function(err,solution){
                        if(err){
                            req.flash("danger", err.name+" : "+err.message);
                            res.redirect("back");
                        }
                        else{
                            if(!solution.down.includes(req.user._id)){
                                next();
                            }
                            else{
                                req.flash("warning", "You have already voted down for that solution");
                                res.redirect('back');
                            }
                        }
                    });
                }
                else{
                    req.flash("warning", "You have to post a solution first to see other solutions");
                    res.redirect('back');
                }
            }
        });
    }
    else{
        req.flash("danger", "You're not allowed to do that, you must be logged in first");
        res.redirect('/login');
    }
}
middlewareObj.canUp = function(req,res,next){
    if(req.isAuthenticated()){
        Challenge.findById(req.params.challengeID).populate('solutions').exec(function(err,challenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                if(challenge.solutions.filter(solution => solution.author.equals(req.user._id)).length>0){
                    Solution.findById(req.params.id,function(err,solution){
                        if(err){
                            req.flash("danger", err.name+" : "+err.message);
                            res.redirect("back");
                        }
                        else{
                            if(!solution.up.includes(req.user._id)){
                                next();
                            }
                            else{
                                req.flash("warning", "You have already voted up for that solution");
                                res.redirect('back');
                            }
                        }
                    });
                }
                else{
                    req.flash("warning", "You have to post a solution first to see other solutions");
                    res.redirect('back');
                }
            }
        });
    }
    else{
        req.flash("danger", "You're not allowed to do that, you must be logged in first");
        res.redirect('/login');
    }
}

module.exports = middlewareObj;