const express = require('express');
const router = express.Router();
const userModel = require("../models/user-model")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isLoggedIn = require("../middlewares/isLoggedIn");
const sendPasswordResetEmail = require('../utils/nodemailer');
const { generateToken } = require('../utils/generateToken');
const productModel = require('../models/product-model')


const { registerUser, loginUser, logout } = require('../controllers/authController')

router.get("/", (req, res) => {
    res.send("It's working ")
})
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
// Forgot Password route
router.get('/forgot-password', (req, res) => {
    let error = req.flash("error");
    let success = req.flash("success");
    res.render('forgot-password', { error, success }); // Create this view to render the form
});

// Forgot Password POST route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('/users/forgot-password');
    }

    // Create reset token
    const resetToken = generateToken(user, '15m'); // Token valid for 15 minutes

    // Send reset token via email
    // await sendPasswordResetEmail(user.email, resetToken);

    req.flash('success', 'Password reset link sent to your email.');
    res.redirect('/');
});

router.get("/cart", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("cart");

    //    const bill=user.cart[0].price+20-user.cart[0].discount;
    res.render("cart", { user });
});
router.get("/addtocart/:productid", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    const productId = req.params.productid;
    if (user.cart.length > 0) {
        try {
            const cartItem = user.cart.find(item => item._id.equals(productId));
            const cartId = cartItem.toString();
            if (cartId === productId) {
                req.flash("success", "Item already added to cart");
            }
        } catch {
            user.cart.push({ _id: productId, quantity: 1 });
            await user.save();
            req.flash("success", "Added to cart");
        }

    }
    else {
        user.cart.push({ _id: productId, quantity: 1 });
        await user.save();
        req.flash("success", "Added to cart");
    }
    res.redirect("/shop");
});

module.exports = router;