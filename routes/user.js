const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/user');


router.get('/register', user.renderRegister);

router.post('/register',catchAsync(user.registerForm));

router.get('/login',user.renderLogin);

router.post('/login',passport.authenticate('local',{ failureFlash: true, failureRedirect:'/login'}),user.loginForm);

router.get('/logout',user.logout);


module.exports = router;