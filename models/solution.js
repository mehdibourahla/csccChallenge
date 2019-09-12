var mongoose = require('mongoose');

var solutionSchema = mongoose.Schema({
    challenge:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge"
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    solution: String,
    created: {
        type: Date,
        default: Date.now
    },
    
    up:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    down:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }] 
});
module.exports = mongoose.model("Solution", solutionSchema);