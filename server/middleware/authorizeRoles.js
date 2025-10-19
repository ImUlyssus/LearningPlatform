/**
 * Middleware to authorize access based on user roles.
 * Assumes that `req.user` is populated by a preceding authentication middleware
 * and contains a `user_role` property (e.g., `req.user.user_role`).
 *
 * @param {Array<number>} allowedRoles - An array of numeric user roles that are permitted to access the route.
 * @returns {Function} Express middleware function.
 */
const authorizeRoles = (allowedRoles) => (req, res, next) => {
  // 1. Check if req.user exists (meaning the user is authenticated)
  if (!req.user) {
    // This scenario should ideally be caught by a 'protect' middleware before this one.
    // However, it's a good safety check.
    return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
  }

  // 2. Get the user's role from the authenticated user object
  const userRole = req.user.user_role;

  // 3. Check if the user's role is included in the list of allowed roles
  if (!allowedRoles.includes(userRole)) {
    // If the user's role is not in the allowed roles, deny access
    return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions for this action.' });
  }

  // 4. If authorized, proceed to the next middleware/route handler
  next();
};

module.exports = { authorizeRoles }