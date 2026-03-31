import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // 3. Check role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // 4. THE CRITICAL STEP: Attach user to the request object
    // Use (req as any) to bypass TypeScript's default Request definition
    (req as any).user = {
      id: decoded.id, // or decoded._id depending on your JWT payload
      role: decoded.role
    };

    next(); // Move to the controller
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};



// auth middleware to check if user is authenticated

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Auth required. No token found." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Attach user to request so the controller can use req.user.id
    (req as any).user = {
      id: decoded.id || decoded._id, // Support both formats
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired." });
  }
};