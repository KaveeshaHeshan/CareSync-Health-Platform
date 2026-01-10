/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * @param {Array} roles - An array of allowed roles (e.g., ['DOCTOR', 'ADMIN'])
 */
module.exports = (roles) => {
  return (req, res, next) => {
    // 1. Ensure the user exists (req.user is populated by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        msg: 'Unauthorized: User session not found' 
      });
    }

    // 2. Check if the user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Access denied: ${req.user.role} role does not have permission for this action` 
      });
    }

    // 3. User has the correct role, proceed to the controller
    next();
  };
};