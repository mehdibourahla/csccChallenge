var mongoose = require('mongoose');
var Solution = require('./solution');
var challengeSchema = mongoose.Schema({
    title: String,
    type: String,
    description: String,
    hint: String,
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    solutions:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solution"
        }
    ],
    created: {type: Date, default: Date.now}
});
challengeSchema.pre('remove', function(next){
    Solution.remove({challenge: this._id}).exec();
    next();
})

module.exports = mongoose.model("Challenge", challengeSchema);