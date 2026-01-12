const jwt = require('jsonwebtoken');
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (error) {
    return null; // If token is invalid or expired
  }
};
module.exports = { verifyToken };
