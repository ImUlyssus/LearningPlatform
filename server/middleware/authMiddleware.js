const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Adjust path to your User model import

module.exports = async (req, res, next) => { // Make it async
  // Get token from header
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Access the user ID from the nested 'user' object in the decoded payload
    if (!decoded.user || !decoded.user.id) {
        console.error('Decoded token payload missing user ID:', decoded);
        return res.status(401).json({ message: 'Token is valid but user ID is missing from payload.' });
    }

    const userIdFromToken = decoded.user.id; // Correctly access the ID
    // Fetch the user from the database using the ID from the token payload.
    const user = await User.findByPk(userIdFromToken, {
      attributes: ['id', 'username', 'email', 'user_role'] // Select only necessary attributes
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found for this token.' });
    }

    // ⭐ FIX START ⭐
    // Attach the user information to the request,
    // explicitly adding a 'roles' array for consistency with authorization checks.
    req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        user_role: user.user_role, // Keep the original string role if needed elsewhere
        roles: [user.user_role] // Convert the single user_role string into an array
    };

    next(); // Move to the next middleware/route handler
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

