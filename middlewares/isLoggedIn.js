const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "You need to login first");
        console.log(req.cookies.token);
        return res.redirect("/");

    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");
        if (!user) {
            res.clearCookie("token");  // Clear the token if user is not found
            req.flash("error", "User not found. Please log in again.");
            return res.redirect("/");
        }
        req.user = user;
        next();
    } catch (err) {
        res.clearCookie("token");
        req.flash("error", "Something went wrong.");
        res.redirect("/");
    }
};
