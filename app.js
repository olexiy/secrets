// jshint esversion:6
/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const md5 = require('md5');

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

// Mongoose onnect
const mongoPass = process.env.MONGO_PASSWORD;
mongoose.connect(`mongodb+srv://mongo_tester:${mongoPass}@cluster0-nl9mk.mongodb.net/secretsDB?retryWrites=true&w=majority`, options);

// Mongoose model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});


const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else if (foundUser) {
      if (foundUser.password === md5(password)) {
        res.render('secrets');
      }
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password),
  });
  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render('secrets');
    }
  });
});


let port = process.env.PORT;
if (port == null || port === '') {
  port = 3000;
}

app.listen(port, () => {
  console.log('Server started on port 3000');
});
