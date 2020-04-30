// jshint esversion:6
/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

// Mongo & Mongoose setup
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
};

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Mongoose onnect
const mongoPass = process.env.MONGO_PASSWORD;
mongoose.connect(`mongodb+srv://mongo_tester:${mongoPass}@cluster0-nl9mk.mongodb.net/secretsDB?retryWrites=true&w=majority`, options);
mongoose.set('useCreateIndex', true);
// Mongoose model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.logIn(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
});

app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // eslint-disable-next-line no-unused-vars
  User.register({ username: req.body.username }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
});

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});


let port = process.env.PORT;
if (port == null || port === '') {
  port = 3000;
}

app.listen(port, () => {
  console.log('Server started on port 3000');
});
