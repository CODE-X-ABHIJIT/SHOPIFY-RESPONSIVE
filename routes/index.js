const express = require("express");
const router = express.Router();
// const Product=require("../models/product-model")
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/", function (req, res) {
    let error = req.flash("error");
    let success = req.flash("success");
    res.render("index", { error, success,loggedin: false });
});

router.get("/shop", isLoggedIn, async (req, res) => {
    let sortOption = {};
    const sortby = req.query.sortby || 'newest'; // Default sorting

    // Apply the sorting based on the query parameter
    if (sortby === 'newest') {
        sortOption.createdAt = -1; // Sort by creation date in descending order (newest first)
    } else if (sortby === 'oldest') {
        sortOption.createdAt = 1; // Sort by creation date in ascending order (oldest first)
    } else if (sortby === 'high-to-low') {
        sortOption.price = -1; // Sort by price in descending order (highest price first)
    } else if (sortby === 'low-to-high') {
        sortOption.price = 1; // Sort by price in ascending order (lowest price first)
    } 

    try {
        // Fetch products and apply sorting
        let products = await productModel.find().sort(sortOption);

        // Filter by discounted products if applicable
        if (req.query.filter === 'discounted') {
            products = products.filter(product => product.discount > 0);
        }

        let success = req.flash("success");
        res.render("shop", { products, success, sortby });
    } catch (error) {
        // console.error(error);
        req.flash("error", "Failed to retrieve products");
        res.redirect("/shop");
    }
});



router.get("/account", isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        res.render("account", { user, messages: req.flash() });
    } catch (error) {
        // console.error(error);
        req.flash("error", "Failed to retrieve account details");
        res.redirect("/account");
    }
});

router.post("/account", isLoggedIn, async (req, res) => {
    const { fullname, contact, oldPassword, newPassword } = req.body;
    
    try {
        const user = await userModel.findOne({ email: req.user.email });
        
        if (oldPassword && newPassword) {
            // Verify old password
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                req.flash("error", "Old password is incorrect");
                return res.redirect("/account");
            }

            // Validate new password
            if (newPassword.length < 6) {
                req.flash("error", "New password must be at least 6 characters long");
                return res.redirect("/account");
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        // Update other user details
        user.fullname = fullname;
        user.contact = contact;
        await user.save();
        
        req.flash("success", "Account details updated successfully");
        res.redirect("/account");
    } catch (error) {
        // console.error(error);
        req.flash("error", "Failed to update account details");
        res.redirect("/account");
    }
});



module.exports = router;
