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