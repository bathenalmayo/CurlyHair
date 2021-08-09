//const { select } = require('async');
const HairProduct = require('../models/hairProduct');
const User = require('../models/user');


module.exports.addToCart = async(req,res)=>{
    const { id } = req.params;
    const selectedProduct = await HairProduct.findById(id);
    //console.log(selectedProduct);
        if(!req.session.cart){
            req.session.cart = [];
            await selectedProduct.updateOne({ $inc: { qty: 1} });
            req.session.cart.push(selectedProduct);

        }else{
            var cart = req.session.cart;
            var newItem = true;
            for(let i = 0; i< Object.keys(cart).length; i++){
                if(cart[i]._id === selectedProduct.id){
                    //console.log("inside the loop!")
                    await selectedProduct.updateOne({ $inc: { qty: 1} });
                    await selectedProduct.save();
                    cart.splice(i,1,selectedProduct);
                    newItem = false;
                    break;
                }
            }
            if(newItem){
                cart.push(selectedProduct);
            }

        }
       // console.log(cart);
        req.flash('success','Product Added To Cart!');
        res.redirect('/hairProducts');

}

module.exports.updateCart = async(req,res) =>{
    const { id } = req.params;
    const selectedProduct = await HairProduct.findById(id);
    const cart = req.session.cart;
    const action = req.query.action;
    
    for(let i = 0; i< Object.keys(cart).length; i++){

        if(cart[i]._id == selectedProduct.id){   
            console.log(selectedProduct);
            console.log(cart[i]);      
            switch(action){
                case "add":
                    await selectedProduct.updateOne({ $inc: { qty: 1} });
                    await selectedProduct.save();
                    cart.splice(i,1,selectedProduct);
                    break;
                case "remove":
                   await selectedProduct.updateOne({ $inc: { qty: -1} });
                   await selectedProduct.save();
                   cart.splice(i,1,selectedProduct);
                    if(selectedProduct.qty < 1){
                        cart.splice(i,1);
                    }
                     break;
                case "clear":
                     cart.splice(i,1);
                     if(cart.length == 0 ){
                         await selectedProduct.updateOne({ $set: { qty: 1} });
                         delete req.session.cart;
                     }
                      break;
                default:
                    console.log("update problem");
                    break;     
            }
            break;
        }
    }
    req.flash('success','Cart Updated!');
    res.redirect('/cart',{cart});
}


module.exports.renderCart = async(req,res) =>{
    const cart = req.session.cart;
    if(cart && cart.length == 0 ){
        delete req.session.cart;
        res.redirect('/cart');
    }else{
        res.render('cart',{cart});
    }
}

module.exports.clearCart =  async(req,res) =>{
    const products= await HairProduct.find({});
    for(let product of products){
         await product.updateOne({ $set: { qty: 1} });
    }
    delete req.session.cart;
    req.flash('success','Cart cleared!');
    res.redirect('/cart');
}
module.exports.renderCheckout = async (req,res) =>{
        delete req.session.cart;
        res.render('checkout');
}

module.exports.checkout =  async(req,res) =>{
    const { id } = req.params;
    const user = await User.findById(id);
    const cart = req.session.cart;
    let selectedProduct;

    for(let i = 0; i< Object.keys(cart).length; i++){

        selectedProduct = await HairProduct.findById(cart[i]._id);
        user.purchase.push(selectedProduct);
        console.log("inside chackout");
        for(let j = 0; j < selectedProduct.buyers.length; j++){
            if(user._id == selectedProduct.buyers[j]){
                selectedProduct.buyers.splice(j,1);        
             }else{
                selectedProduct.buyers.push(user);
             }
        }
        await selectedProduct.updateOne({ $inc: { stock: -1} , $set: { qty: 1}});
        await selectedProduct.save();
        await user.save();
    }
    res.redirect('/checkout');
}