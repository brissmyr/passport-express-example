const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

const users = [];

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function (email, password, done) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    return done(null, user);
  } else {
    return done(null, false, { message: 'Invalid email or password.' });
  }
}
));


passport.serializeUser(function (user, done) {
  done(null, user.email);
});

passport.deserializeUser(function (email, done) {
  const user = users.find(u => u.email === email);
  if (user) {
    done(null, user);
  } else {
    done(new Error('User not found'));
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  res.render('welcome');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('login', { errorMessage: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const existingUser = users.find(u => u.email === req.body.email);

  if (existingUser) {
    return res.render('signup', { errorMessage: 'Email is already in use.' });
  }

  users.push({
    email: req.body.email,
    password: req.body.password
  });

  res.redirect('/login');
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('An error occurred while logging out.');
    }
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
