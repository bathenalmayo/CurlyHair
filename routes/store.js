const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middelware');
const catchAsync = require('../utils/catchAsync');
const store = require('../controllers/store');


router.get('/add/:id', catchAsync(store.addToCart));

router.get('/update/:id',catchAsync(store.updateCart));

router.get('/cart',isLoggedIn, catchAsync(store.renderCart));
router.get('/cart/clear', catchAsync(store.clearCart));

router.get('/checkout/:id',isLoggedIn, catchAsync(store.checkout));
router.get('/checkout',isLoggedIn, catchAsync(store.renderCheckout));

module.exports = router;