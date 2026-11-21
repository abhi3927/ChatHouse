import jwt from "jsonwebtoken";

// Verifies the "token" cookie and exposes the logged-in user's id as req.userId.
const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = String(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

export default isAuthenticated;
