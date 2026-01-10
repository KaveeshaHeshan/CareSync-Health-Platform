const jwt = require('jsonwebtoken');

/**
 * AUTHENTICATION MIDDLEWARE
 * Verifies the JSON Web Token (JWT) sent in the request headers.
 */
module.exports = (req, res, next) => {
  // 1. Get token from the header (Format: Authorization: Bearer <token>)
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Check if no token is present
  if (!token) {
    return res.status(401).json({ 
      msg: 'No token provided, authorization denied' 
    });
  }

  try {
    // 3. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user info (id and role) to the request object
    // This allows controllers to access req.user.id and req.user.role
    req.user = decoded.user;

    // 5. Move to the next middleware or controller
    next();
  } catch (err) {
    // 6. Handle invalid or expired tokens
    res.status(401).json({ 
      msg: 'Token is not valid or has expired' 
    });
  }
};