const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated } = require('../middlewares/auth'); // Ensure this middleware is set up for authentication
const ownerModel = require('../models/owners-model')
const productModel = require('../models/product-model')
const isLoggedIn = require('../middlewares/isLoggedIn')

if (process.env.NODE_ENV === "development") {
    router.post("/create", async (req, res) => {
        let owners = await ownerModel.find();
        if (owners.length > 0) {
            req.flash("error", "You don't have permission to create a new owner");
            return res.redirect("/owners/register");
        }
        let { fullname, email, password } = req.body;
        let createdowner = await ownerModel.create({
            fullname,
            email,
            password,
        });
        req.flash("success", "Owner created successfully");
        res.redirect('/owners/login');
    });
}

const storage = multer.memoryStorage(); // Use memory storage to handle file uploads
const upload = multer({ storage: storage });
const bcrypt = require('bcrypt'); // For password hashing
const session = require('express-session'); // For session management

// Session setup
router.use(session({
    secret: process.env.JWT_KEY,
    resave: false,
    saveUninitialized: true
}));

router.get("/register",isLoggedIn, (req, res) => {
    const messages = {
        error: req.flash("error"),
        success: req.flash("success"),
    };
    res.render("owner-register", { messages });
});

// Owner registration route
router.post("/register", async (req, res) => {
    const { fullname, email, password, gstin } = req.body;

    try {
        // Check if owner already exists
        let owner = await ownerModel.findOne({ email });
        if (owner) {
            req.flash("error", "Owner already exists with this email.");
            return res.redirect("/owners/register");
        }

        // Create a new owner
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        owner = new ownerModel({
            fullname,
            email,
            password: hashedPassword,
            gstin,
        });

        await owner.save();
        req.flash("success", "Registration successful. Please log in.");
        res.redirect("/owners/login"); // Redirect to login after successful registration
    } catch (error) {
        req.flash("error", "Server error. Please try again later.");
        res.redirect("/owners/register");
    }
});

router.get("/login",isLoggedIn, (req, res) => {
    const messages = {
        error: req.flash("error"),
        success: req.flash("success"),
    };
    res.render("owner-register", { messages });
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find owner by email
        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/owners/login");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/owners/login");
        }

        // Set session
        req.session.ownerId = owner._id;
        req.flash("success", "Logged in successfully.");
        res.redirect('/owners/dashboard'); // Redirect to owner dashboard or another protected page
    } catch (error) {
        req.flash("error", "Server error. Please try again later.");
        res.redirect("/owners/login");
    }
});
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // For sending emails


// Forgot Password form submission route

router.get('/forgot-password', isLoggedIn,(req, res) => {
    const messages = {
        error: req.flash("error"),
        success: req.flash("success"),
    };
    res.render('owner-forgot-password', { messages });
});
router.post('/forgot-password',isLoggedIn, async (req, res) => {
    const { email } = req.body;

    try {
        // Check if owner exists
        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/owners/forgot-password');
        }

        // Generate reset token
       
        req.flash('success', 'An email has been sent with further instructions.');
        res.redirect('/owners/forgot-password');

    } catch (error) {
        req.flash('error', 'Server error. Please try again later.');
        res.redirect('/owners/forgot-password');
    }
});

// Dashboard route
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const owner = await ownerModel.findById(req.session.ownerId); // Retrieve the owner by ID from the session
        if (!owner) {
            req.flash('error', 'Owner not found.');
            return res.redirect('/owners/login'); // Redirect to login if owner is not found
        }

        // Fetch products created by this owner
        const products = await productModel.find({ ownerId: owner._id }); // Adjust query if needed

        res.render('dashboard', { 
            owner, 
            products,
            messages: req.flash() // Include flash messages here
        });
    } catch (error) {
        req.flash('error', 'Server error. Please try again later.');
        res.redirect('/owners/dashboard'); // Redirect to dashboard if there's an error
    }
});

// Route to render the edit form with existing product details
router.get('/admin/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/owners/dashboard');
        }
        res.render('editProduct', { product, success: req.flash('success') });
    } catch (error) {
        req.flash('error', 'Error fetching product details. Please try again.');
        res.redirect('/owners/dashboard');
    }
});

// Route to handle the update of a product
router.post('/admin/edit/:id',ensureAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { name, price, discount, bgcolor, panelcolor, textcolor, description,quantity } = req.body;
        const image = req.file ? req.file.buffer : null; // Use buffer if file is uploaded

        // Find the product by ID
        const product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/owners/dashboard');
        }

        // Update product details
        product.name = name;
        product.price = price;
        product.discount = discount;
        product.bgcolor = bgcolor;
        product.panelcolor = panelcolor;
        product.textcolor = textcolor;
        product.description = description; // Update the description
        product.quantity = quantity; // Ensure quantity is updated
        if (image) {
            product.image = image; // Update image if a new file is uploaded
        }
        await product.save();

        req.flash('success', 'Product updated successfully.');
        res.redirect('/owners/dashboard');
    } catch (error) {
        req.flash('error', 'Error updating product. Please try again.');
        res.redirect(`/owners/admin/edit/${req.params.id}`);
    }
});


// Route to handle product deletion
router.post('/admin/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        await productModel.findByIdAndDelete(productId);

        req.flash('success', 'Product deleted successfully.');
        res.redirect('/owners/dashboard');
    } catch (error) {
        req.flash('error', 'Error deleting product. Please try again.');
        res.redirect('/owners/dashboard');
    }
});

router.get('/logout', ensureAuthenticated, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.flash('error', 'Logout failed. Please try again later.');
            return res.redirect('/owners/dashboard');
        }
        // req.flash('success', 'Logged out successfully.');
        res.redirect('/owners/login'); // Redirect to login page after logout
    });
});

router.get("/admin", ensureAuthenticated,(req, res) => {
    let success = req.flash("success");
    res.render("createproducts", { success });
})

module.exports = router;
