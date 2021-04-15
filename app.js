//.......preinstalled imports
const path = require('path');
const https = require('https');
const fs = require('fs');
 
//......third-party-libraries
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const compression = require('compression');

//...........routes
const adminRoutes = require('./routes/admin');
const custRoutes = require('./routes/customer');
const shopRoutes = require('./routes/shop');
const errRoute = require('./routes/error');

//.....modules
const User = require('./models/user');
const authMiddleware = require('./middlewares/isAuth');

const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWD}@cluster0.amlja.mongodb.net/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority`;
const csrfProtection = csrf();

const store = new MongoDBStore({
     uri: MONGODB_URI,
     collection: 'sessions'
});

//....dynamic engine set
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules', 'bootstrap')));

app.use(
    session(
        {
            secret: 'my secret', 
            resave: false, 
            saveUninitialized: false, 
            store: store
        }
    )
);

app.use(csrfProtection);
app.use(flash());

// const serverKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

app.use((req, res, next) => {
    const auth_t = req.session.user_t;
    const isAuth = req.session.loggedIn;
    let auth = 0;
    if(isAuth == false) auth = 0;
    else if(auth_t === 'admin') auth = 1;
    else if(auth_t === 'customer') auth = 2;

    res.locals.auth = auth;
    res.locals.csrfToken = req.csrfToken();

    next();
});

app.use((req, res, next) => {

    if(!req.session.userId){
        return next();
    }
    
    User.findById(req.session.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use(compression());

app.use(shopRoutes);
app.use('/admin',authMiddleware.isAdmin, adminRoutes);

app.use(authMiddleware.isCustomer, custRoutes);

app.use(errRoute);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        console.log("Connected!");

        // https.createServer({key: serverKey, cert: certificate}, app).listen(process.env.PORT || 3000);
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err);
    })

