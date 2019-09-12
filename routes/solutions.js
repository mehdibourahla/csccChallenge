var express = require('express');
var router = express.Router({mergeParams:true});
var Solution = require('../models/solution');
var Challenge = require('../models/challenge');
var middleware = require('../middleware');
var helper = require('../helpers');
var { validationResult } = require('express-validator');


//LIST ALL SOLUTIONS FOR A CHALLENGE
router.get("/",middleware.canSeeSolutions,function(req,res){
    Challenge.findById(req.params.challengeID).populate('author')
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
                    res.render("solutions/index",{similarChallenges:similarChallenges,challenge:challenge});
                }
            })
        }
    });
});
//RENDER NEW SOLUTION FORM
router.get("/new",middleware.isLoggedIn,function(req,res){
    Challenge.findById(req.params.challengeID,function(err,challenge){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            res.render("solutions/new",{challenge:challenge});
        }
    });
});
//HANDLE NEW SOLUTION LOGIC
router.post("/",middleware.isLoggedIn,middleware.checkSolution,function(req,res){
    var Result = validationResult(req);
    if(!Result.isEmpty()){
        req.flash("danger", Result.errors[0].msg);
        res.redirect("back");
    }
    else{
        Challenge.findById(req.params.challengeID,function(err,challenge){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                var solution = req.body.solution;
                Solution.create(solution,function(err,createdSolution){
                    if(err){
                        req.flash("danger", err.name+" : "+err.message);
                        res.redirect("back");
                    }
                    else{
                        createdSolution.author = req.user._id;
                        createdSolution.challenge = challenge._id;
                        createdSolution.save();
                        challenge.solutions.push(createdSolution);
                        challenge.save();
                        req.flash("success", "You have created a new Solution! Share it to get votes.");
                        res.redirect("/challenges/"+req.params.challengeID+"/solutions");
                    }
                });
            }
        });
    }
});
//SHOW A SOLUTION
router.get("/:id",middleware.canSeeSolutions,function(req,res){
    Solution.findById(req.params.id,function(err,solution){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            res.render("solutions/show",{solution:solution});
        }
    });
});
//RENDER EDIT SOLUTION FORM
router.get("/:id/edit",middleware.checkSolutionOwnership,function(req,res){
    Challenge.findById(req.params.challengeID,function(err,challenge){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            Solution.findById(req.params.id,function(err,solution){
                if(err){
                    req.flash("danger", err.name+" : "+err.message);
                    res.redirect("back");
                }
                else{
                    res.render("solutions/edit",{challenge:challenge,solution:solution});
                }
            });
        }
    })
});
//HANDLE EDIT SOLUTION LOGIC
router.put("/:id",middleware.checkSolutionOwnership,middleware.checkSolution,function(req,res){
    var Result = validationResult(req);
    if(!Result.isEmpty()){
        req.flash("danger", Result.errors[0].msg);
        res.redirect("back");
    }
    else{
        var solution = req.body.solution;
        Solution.findByIdAndUpdate(req.params.id,solution,function(err,updatedSolution){
            if(err){
                req.flash("danger", err.name+" : "+err.message);
                res.redirect("back");
            }
            else{
                req.flash("success", "You have to edited the solution successfuly!");
                res.redirect("/challenges/"+req.params.challengeID+"/solutions");
            }
        });
    }
});
//HANDLE DELETE SOLUTION LOGIC
router.delete("/:id",middleware.checkSolutionOwnership,function(req,res){
    Solution.findByIdAndDelete(req.params.id,function(err){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        helper.getUserScore(req.user._id);
        req.flash("success", "You have to deleted the solution successfuly");
        res.redirect("/challenges/"+req.params.challengeID);
    }); 
});

router.put("/:id/up",middleware.canUp,function(req,res){
    Solution.findById(req.params.id,function(err,solution){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            solution.up.push(req.user._id);
            if(solution.down.includes(req.user._id)){
                solution.down
                .splice(solution.down.indexOf(req.user._id),1);
            }
            solution.save(function(err){
                if(err){
                    req.flash("danger", err.name+" : "+err.message);
                    res.redirect("back");
                }
                else{
                    helper.getUserScore(req.user._id);
                    res.redirect("/challenges/"+req.params.challengeID+"/solutions");
                }
            });
        }
    });
});
router.put("/:id/down",middleware.canDown,function(req,res){
    Solution.findById(req.params.id,function(err,solution){
        if(err){
            req.flash("danger", err.name+" : "+err.message);
            res.redirect("back");
        }
        else{
            solution.down.push(req.user._id);
            if(solution.up.includes(req.user._id)){
                solution.up
                .splice(solution.up.indexOf(req.user._id),1);
            }
            solution.save(function(err){
                if(err){
                    req.flash("danger", err.name+" : "+err.message);
                    res.redirect("back");
                }
                else{
                    helper.getUserScore(req.user._id);
                    res.redirect("/challenges/"+req.params.challengeID+"/solutions");
                }
            });
        }
    });
});

module.exports = router;