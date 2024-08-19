const express = require("express");
const router = express.Router();
// const Product=require("../models/product-model")
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", { error, loggedin: false });
});

router.get("/shop", isLoggedIn, async (req, res) => {
    let products = await productModel.find()
    let success = req.flash("success");
    res.render("shop", { products, success });
});
router.get("/cart", isLoggedIn, async (req, res) => {
   let user= await userModel.findOne({email:req.user.email}).populate("cart");

   const bill=user.cart[0].price+20-user.cart[0].discount;
    res.render("cart",{ user,bill});
});
router.get("/addtocart/:productid", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success", "added to cart");
    res.redirect("/shop");
});



module.exports = router;
