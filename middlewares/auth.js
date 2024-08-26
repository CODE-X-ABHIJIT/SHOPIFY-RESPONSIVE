// middleware/auth.js
module.exports.ensureAuthenticated = function(req, res, next) {
    if (req.session && req.session.ownerId) {
        return next();
    }
    res.redirect('/owners/login'); // Redirect to login if not authenticated
};
