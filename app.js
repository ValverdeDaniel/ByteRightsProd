require('https').globalAgent.options.rejectUnauthorized = false;
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');


//load Models
require('./models/User');
require('./models/Proposal');
require('./models/StripeTransaction')

//passport config
require('./config/passport')(passport);

//const sessionStore = new MongoStore({ url: keys.mongoURI, autoReconnect: true });

//load routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const dashboard = require('./routes/dashboard');
const proposals = require('./routes/proposals');
const stripe = require('./routes/stripe');

//load keys file
const keys = require('./config/keys');

//handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon,
  ifLoggedUserEqProposalUser,
  ifCompensationEqBlank,
  ifCompanyNameEqBlank,
  ifStripeAccountIdEqBlank,
  ifEquals
} = require('./helpers/hbs');

//map global promises
mongoose.Promise = global.Promise;

//mongoose connect
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app = express();

//body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//session middleware
app.use(session({
  secret: 'sessionTesting',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ url: keys.mongoURI, autoReconnect: true })
}));

//method override middleware
app.use(methodOverride('_method'));

//handlebars middleware
app.engine('handlebars', exphbs({
  helpers: {
    truncate: truncate,
    stripTags: stripTags,
    formatDate: formatDate,
    select: select,
    editIcon: editIcon,
    ifLoggedUserEqProposalUser: ifLoggedUserEqProposalUser,
    ifCompensationEqBlank: ifCompensationEqBlank,
    ifCompanyNameEqBlank: ifCompanyNameEqBlank,
    ifStripeAccountIdEqBlank: ifStripeAccountIdEqBlank,
    ifEquals: ifEquals
  },
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(cookieParser());

//passport Middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session())

//set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//use routes
app.use('/', index);
app.use('/auth', auth)
app.use('/dashboard', dashboard)
app.use('/proposals', proposals)
app.use('/stripe', stripe)

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});