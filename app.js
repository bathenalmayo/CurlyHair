if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: '.env' });
}
//console.log(process.env);
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const HairProduct = require('./models/hairProduct');
const User = require('./models/user');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressErrors');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { isLoggedIn } = require('./middelware');
const userRoute = require('./routes/user');
const storeRoute = require('./routes/store');
const MongoDBStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/curlyHair';

//'mongodb://localhost:27017/curlyHair'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thisismysecret';

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60

});

// app.use(session({
//     secret: 'foo',
//     store: MongoDBStore.create({
//     url: dbUrl,
//     secret: 'thisismysecret',
//     touchAfter: 24 * 60 * 60
// store: MongoDBStore.create({
//     mongoUrl: dbUrl,
//     secret: 'thisismysecret',
//     touchAfter: 24 * 60 * 60

// })

// })
// }));
store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e);
});

//creating my own session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expire date to a week from this date
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//A Middelware for flashing the user everytime something new accures
app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.cart = req.session.cart;
    res.locals.qty = req.session.qty;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//routes
app.use('/', userRoute);
app.use('/', storeRoute);

app.get('/', (req, res) => {
    res.render('home');
})

// app.get('/hairProducts', async (req,res)=>{
//     const cantu = new HairProduct({ name:'blah blah'});
//     await cantu.save();
//     console.log(cantu); //{"_id":"60af77a52fe3662efcf1f237","name":"blah blah","__v":0}
//     res.send(cantu);
// })

app.get('/hairProducts', catchAsync(async (req, res) => {
    const products = await HairProduct.find({});
    res.render('hairProduct', { products })
}))

app.get('/blog', isLoggedIn, async (req, res) => {

    res.render('blog');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404))
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`your on port ${port}`);
})