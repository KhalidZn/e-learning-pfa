var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var expressHbs=require('express-handlebars');
var mongoose=require('mongoose');
var session=require('express-session');
var passport=require('passport');
var flash=require('connect-flash');
var validator=require('express-validator');
var MongoStore=require('connect-mongo')(session);
var moment=require('moment');

var Handlebars = require("handlebars");
var MomentHandler=require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);

var index = require('./routes/index');

var app = express();

//mongoose.connect('localhost:27017/elearning');
mongoose.connect(process.env.MONGODB_URI);
require('./config/passport');

// view engine setup
app.engine('.hbs',expressHbs({defaultLayout:'layout',extname:'.hbs'}))
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret:'e-learning secret',
  resave:false,
  saveUninitialized:false,
  store:new MongoStore({ mongooseConnection:mongoose.connection}),
  cookie:{maxAge:180*60*1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req,res,next) {
  res.locals.login=req.isAuthenticated();
  res.locals.session=req.session;
  res.locals.user=req.user || null;
  if(req.user!=null){
  res.locals.isFormer=req.user.type=="former" || false;}
  next();
})

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
