import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

const admins = [1, 2, 3, 106, 110];

export function isAdmin(user_id) {
  return admins.includes(user_id);
}

export function authenticateAdmin(req, res, next) {
  const user_id = req.user.user_id;

  if (!admins.includes(user_id)) return res.status(403).json({ error: "Not an admin" });
  next();
}
