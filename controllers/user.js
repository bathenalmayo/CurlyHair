const User = require('../models/user');


module.exports.renderRegister = (req,res) =>{
    res.render('users/register');
}
module.exports.registerForm = async (req,res,next) =>{
    try{
        const { email, username, password} =  req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash('success','WELCOME TO MY WEBSITE!');
            console.log(registeredUser);
            res.redirect('/');  
        })  
    } catch(e){
        req.flash('error', e.massege);
        res.redirect('register');
    }
}
module.exports.renderLogin = (req,res) =>{
    res.render('users/login');
}
module.exports.loginForm = (req,res) =>{ //insted of local i can change it to google or facebook
    req.flash('success','Welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}
module.exports.logout = (req,res) =>{
    req.logOut();
    req.flash('success','Goodbye!');
    res.redirect('/')
}