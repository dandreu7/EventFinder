// middlewares/auth.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next(); // Proceed if the user is authenticated
    }
    res.redirect('/users/login'); // Redirect to login if not authenticated
  }
  
  module.exports = isAuthenticated;
  