require('https').globalAgent.options.rejectUnauthorized = false;
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');


//load Models
require('./models/User');
require('./models/Proposal');

//passport config
require('./config/passport')(passport);

//load routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const dashboard = require('./routes/dashboard');
const proposals = require('./routes/proposals');

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
  ifCompanyNameEqBlank
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
    ifCompanyNameEqBlank: ifCompanyNameEqBlank
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

//setting connect-flash
app.use(flash());

// Flash related Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

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

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});