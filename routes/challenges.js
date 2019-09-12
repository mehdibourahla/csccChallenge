var express = require('express');
var Challenge = require('../models/challenge');
var User = require('../models/user');
var router = express.Router({mergeParams: true});
var middleware = require('../middleware');
var helper = require('../helpers');
var { validationResult } = require('express-validator');

//LIST ALL CHALLENGES
router.get("/", function(req,res){
    Challenge.find({}).populate('author').exec(function(err,challenges){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            // User.remove({username:"Peach"},function(err,users){
            //     if(err){
            //         console.log(err);
            //     }
            //     else{
            //         console.log(users);
            //     }
            // })
            User.find({},function(err,users){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(users);
                }
            })
            res.render("challenges/index", {challenges: challenges});   
        }
    });
    
});
//RENDER NEW CHALLENGE FORM
router.get("/new",middleware.isLoggedIn,function(req,res){
    res.render("challenges/new");
});
//HANDLE NEW CHALLENGE LOGIC
router.post("/",middleware.isLoggedIn, middleware.checkChallenge,function(req,res){
    var Result = validationResult(req);
    if(!Result.isEmpty()){
        req.flash("danger", Result.errors[0].msg);
        res.redirect("back");
    }
    else{
        var challenge = req.body.challenge;
        Challenge.create(challenge,function(err,createdChallenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                User.findById(req.user,function(err,user){
                    if(err){
                        req.flash("danger", err.name+" : "+err.message);
                        res.redirect("back");
                    }
                    else{
                        createdChallenge.author = user._id;
                        createdChallenge.save();
                        req.flash("success", "You have created a new Challenge! Go ahead and post the first solution.");
                        res.redirect("/challenges");
                    }
                });  
            }
        });
    }
    
});
//SHOW A CHALLENGE
router.get("/:id",function(req,res){
    Challenge.findById(req.params.id).populate('author')
    .populate({path:'solutions', populate:{path:'author'}}).exec(function(err,challenge){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            Challenge.find({type: challenge.type, _id: { $ne : challenge._id}},function(err,similarChallenges){
                if(err){
                    req.flash("danger", err.name+" : "+err.message);
                    res.redirect("back");
                }
                else{
                    res.render("challenges/show",{similarChallenges:similarChallenges,challenge:challenge});
                }
            })
        }
    });
});
//RENDER EDIT CHALLENGE FORM
router.get("/:id/edit",middleware.checkChallengeOwnership,function(req,res){
    Challenge.findById(req.params.id,function(err,challenge){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            res.render("challenges/edit",{challenge:challenge});
        }
    });
});
//HANDLE EDIT CHALLENGE LOGIC
router.put("/:id",middleware.checkChallengeOwnership, middleware.checkChallenge,function(req,res){
    var Result = validationResult(req);
    if(!Result.isEmpty()){
        req.flash("danger", Result.errors[0].msg);
        res.redirect("back");
    }
    else{
        var challenge = req.body.challenge;
        Challenge.findByIdAndUpdate(req.params.id,challenge,function(err,updatedChallenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                req.flash("success", "You have to edited the challenge successfuly!");
                res.redirect("/challenges/"+req.params.id);
            }
        });
    }
});
//HANDLE DELETE CHALLENGE LOGIC
router.delete("/:id",middleware.checkChallengeOwnership,function(req,res){
    Challenge.findById(req.params.id,function(err,challenge){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            challenge.remove(function(err){
                if(err){
                    req.flash("danger", err.name+" : "+err.message);
                    res.redirect("back");
                }
                else{
                    helper.getUserScore(req.user._id);
                    req.flash("success", "You have to deleted the challenge successfuly");
                    res.redirect("/challenges");
                }
            });
            
        }
    });
});

module.exports = router;