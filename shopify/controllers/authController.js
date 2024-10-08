const userModel = require("../models/user-model");
const ownerModel = require("../models/owners-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken")


module.exports.registerUser = async (req, res) => {
    try {
        let { email, password, fullname } = req.body;

        let user = await userModel.findOne({ email });
        if (user) {
            req.flash("error", "You already have an account, please login.");
            return res.redirect("/");
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create the new user
        user = await userModel.create({
            email,
            password: hash,
            fullname
        });

        // Generate token and set cookie
        let token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "User created successfully.");

        // Redirect after registration is complete
        res.redirect("/shop");
    } catch (err) {
        res.send(err.message);
    }
}

module.exports.loginUser = async (req, res) => {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) {
        req.flash("error", "Email or Password is incorrect");
        return res.redirect("/");
    }
    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = generateToken(user);
            res.cookie("token", token);
            //  res.send("Logged in successfully");
            return res.redirect("/shop");
        }
    
        else {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/");
        }
    })
}


module.exports.logout=(req, res) => {
    req.session.ownerId = null;
    res.cookie("token","",{ expires: new Date(0) });
    res.redirect("/");
}