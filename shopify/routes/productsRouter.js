const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require("../models/product-model");
const isLoggedIn = require('../middlewares/isLoggedIn');
const ownerModel = require('../models/owners-model');

// Create Product Route
router.post('/create', upload.single('image'), isLoggedIn, async (req, res) => {
    try {
        const ownerId = req.session.ownerId;
        let { name, price, discount, bgcolor, panelcolor, textcolor, description, quantity } = req.body;
        const currentDate = new Date();

        // Ensure quantity is a number
        quantity = Number(quantity) || 0;

        // Create the product object
        let productData = {
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
            description,
            ownerId,
            quantity,
            createdAt: currentDate,
            updatedAt: currentDate
        };

        if (req.file) {
            productData.image = req.file.buffer;
        }

        let product = await productModel.create(productData);

        let owner = await ownerModel.findById(ownerId);
        if (owner) {
            if (!owner.products.includes(product._id)) {
                owner.products.push(product._id);
                await owner.save();
            }
        }

        req.flash('success', 'Product created successfully.');
        res.redirect('/owners/admin');
    } catch (err) {
        // console.error(err);
        req.flash('error', err.message);
        res.redirect('/owners/admin');
    }
});

// Edit Product Route
router.post("/edit/:id", upload.single("image"), isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        let { name, price, discount, bgcolor, panelcolor, textcolor, description, quantity } = req.body;
        const currentDate = new Date();

        // Ensure quantity is a number
        quantity = Number(quantity) || 0;

        let updateData = {
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
            description,
            quantity,
            updatedAt: currentDate
        };

        if (req.file) {
            updateData.image = req.file.buffer;
        }

        let product = await productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, omitUndefined: true }
        );

        req.flash("success", "Product updated successfully.");
        res.redirect("/owners/admin");
    } catch (err) {
        // console.error(err);
        req.flash("error", err.message);
        res.redirect("/owners/admin");
    }
});

// Get Product Details Route
router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect("/shop");
        }
        res.render("product-detail", { product });
    } catch (error) {
        // console.error(error);
        req.flash("error", "Failed to load product details");
        res.redirect("/shop");
    }
});

module.exports = router;
