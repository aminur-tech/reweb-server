import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";
import { User } from "../models/user.model";
import { sendEmail } from "../utils/sendEmail";

const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // ... existing check if user exists ...

    // Generate code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const savedUser = await User.create({
      ...req.body,
      verificationCode, // Store it in DB
      isVerified: false,
    });

    // 🔥 SEND THE MAIL HERE
    try {
      await sendEmail(savedUser.email, verificationCode);
    } catch (mailError) {
      console.error("Email failed to send:", mailError);
      // Optional: You might want to delete the user or tell them to "Resend"
    }

    res.status(201).json({
      success: true,
      message: "User registered. Please check your email for verification code.",
      data: { email: savedUser.email }, // Minimize data sent back
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to register", error: err.message });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code or email",
      });
    }

    // Update user status
    user.isVerified = true;
    user.verificationCode = undefined; 
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Verification failed", error: err.message });
  }
};



// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 🔥 NEW: Send new code if not verified
    if (!user.isVerified) {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = newCode;
      await user.save();
      
      await sendEmail(user.email, newCode);

      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in", // Frontend checks for "verify"
      });
    }

    // ... check password logic ...
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Login user with Google
const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // The user model requires a password. For social logins, we can
      // generate a random one that won't be used for login.
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        email,
        name,
        password: randomPassword,
        role: "client", // 'user' is not a valid role in your schema enum
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any },
    );

    // Omit password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User logged in successfully with Google",
      token,
      data: userResponse,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to login with Google",
      error: err.message,
    });
  }
};

// Get all users
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};


const updateProfile = async (req: Request, res: Response) => {
  try {
    // Assuming you have an auth middleware that puts user info in req.user
    const userId = (req as any).user.id; 
    const { name, image } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, image },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: err.message,
    });
  }
};



export const userControllers = {
  register,
  login,
  getUsers,
  googleLogin,
  updateProfile,
  verifyEmail
};
