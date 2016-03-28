	require('dotenv').load();

	var express  = require('express');
	var app      = express();
	var port     = process.env.PORT || 8080;
	var mongoose = require('mongoose');
	var passport = require('passport');
	var flash    = require('connect-flash');
	var morgan = require('morgan');
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
	var session = require('express-session');
	var ejs = require('ejs');
	var notify = require('push-notify');
	var fs = require('fs');

	mongoose.connect(process.env.MONGOLAB_URI);

	var app = express();

	app.use(morgan('dev'));
	app.use(cookieParser());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.set('view engine', 'ejs'); 
	app.use(session({ secret: 'EverybodyScreamsFTP' })); 
	app.use(passport.initialize());
	app.use(passport.session()); 
	app.use(flash()); 

	var apn = notify.apn({
		key: 'apple_push_notifications.pem',
		cert: 'apple_push_notifications.pem'
	});

	require('./passport')(passport);

	app.get('/', function(req, res) {
		res.render('index.ejs'); 
	});
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/dashboard', 
		failureRedirect : '/login', 
		failureFlash : true 
	}));
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/dashboard', 
		failureRedirect : '/signup', 
		failureFlash : true 
	}));
	app.get('/dashboard', isLoggedIn, function(req, res) {
		res.render('dashboard.ejs', {
			user : req.user
		});
	});
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/status', function(req, res) {

		var json = fs.readFileSync(path.join(__dirname, "status.json"));
		res.send(json);

	});

	app.post('/updateStore', function(req, res) {

		var json = {
			"staus": req.body.stat,
			"imageURL": req.body.imageURL,
			"message": req.body.message
		};

		fs.writeFile('status.json', JSON.stringify(json, null, 4), function(err) {

        });

	});

	app.post('/push', isLoggedIn, function(req, res) {

		apn.send({
			token: '<7a2572fd 97d398d2 0adb6dc2 f4220464 3429f861 4b2b72d9 ead1db86 e49a1b92>',
			alert: req.body.message
		});

	});

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();
		res.redirect('/');
	}



	app.listen(8080, function(){
	  console.log('Admin Panel is running on port 8080');
	});
