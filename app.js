require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const ejs = require('ejs');
const path = require('path');

const CastleApiHelper = require('./castleHelper');
const castleApiHelper = new CastleApiHelper(process.env.CASTLE_API_SECRET);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

function renderWithLayout(view, options = {}) {
  return async (req, res, next) => {
    try {
      const renderOptions = {
        ...options,
        user: req.user
      };
      const content = await ejs.renderFile(`views/${view}.ejs`, renderOptions);
      res.render('layout', {
        title: options.title || 'Untitled',
        content: content,
        castlePublishableKey: process.env.CASTLE_PUBLISHABLE_KEY,
      });
    } catch (err) {
      next(err);
    }
  };
}

function renderWithError(view, title, errorMessage) {
  return renderWithLayout(view, { title, errorMessage });
}

app.get('/', renderWithLayout('index', { title: 'Welcome' }));

app.get('/login', renderWithLayout('login', { title: 'Log in' }));

app.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      await castleApiHelper.sendEvent(req, '/v1/filter', {
        type: "$login",
        status: "$failed",
        params: {
          email: req.body.email,
        },
      });

      return await renderWithError('login', 'Log in', info.message)(req, res, next);
    }
    req.logIn(user, async (err) => {
      if (err) {

        await castleApiHelper.sendEvent(req, '/v1/filter', {
          type: "$login",
          status: "$failed",
          params: {
            email: req.body.email,
          },
        });

        return next(err);
      }

      const event = await castleApiHelper.sendEvent(req, '/v1/risk', {
        type: "$login",
        status: "$succeeded",
        user: {
          id: "887",
          email: req.body.email,
        },
      });
      console.log(event)

      if (event.policy.action === 'deny') {
        return await renderWithError('login', 'Log in', 'Please try again later.')(req, res, next);
      }

      return res.redirect('/dashboard');
    });
  })(req, res, next);
});


app.get('/signup', renderWithLayout('signup', { title: 'Sign up' }));

app.post('/signup', async (req, res) => {
  const existingUser = users.find(u => u.email === req.body.email);

  const event = await castleApiHelper.sendEvent(req, '/v1/filter', {
    type: "$registration",
    status: "$attempted",
    user: {
      id: "887",
      email: req.body.email,
    },
  });

  if (event.policy.action === 'deny') {
    return await renderWithError('signup', 'Sign up', 'Please try again later.')(req, res);
  }

  if (existingUser) {
    return await renderWithError('signup', 'Sign up', 'Email is already in use.')(req, res);
  }

  users.push({
    email: req.body.email,
    password: req.body.password
  });

  res.redirect('/login');
});

app.get('/dashboard', isAuthenticated, renderWithLayout('dashboard', { title: 'Dashboard' }));

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
