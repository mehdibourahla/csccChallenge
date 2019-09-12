var express = require('express');
var app     = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var passport              = require('passport');
var LocalStrategy         = require('passport-local');
var User = require('./models/user');
var challengesRoutes = require("./routes/challenges");
var indexRoutes = require("./routes/index");
var solutionsRoutes = require("./routes/solutions");
var flash = require('connect-flash');

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));


var url = process.env.DATABASEURL || "mongodb://localhost/csccChallenge";
mongoose.connect(url, {useNewUrlParser: true});

//PASSPORT CONFIGURATION
app.use(require('express-session')({      
	secret: "Something i don't know yet", 
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize()); 
app.use(passport.session());   
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    res.locals.danger = req.flash("danger");
    next();
});


//====================
//ROUTES
//====================
app.use(indexRoutes);
app.use("/challenges",challengesRoutes);
app.use("/challenges/:challengeID/solutions",solutionsRoutes);

var PORT = process.env.PORT || 3000 ;
app.listen(PORT,process.env.IP,function(){
    console.log("Server ON");
});