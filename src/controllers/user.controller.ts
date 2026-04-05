import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";
import { User } from "../models/user.model";
import { sendEmail } from "../utils/sendEmail";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // Generate code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const savedUser = await User.create({
      ...req.body,
      verificationCode, // Store it in DB
      isVerified: false,
    });

    // SEND THE MAIL HERE
    try {
      await sendEmail(savedUser.email, verificationCode);
    } catch (mailError) {
      console.error("Email failed to send:", mailError);
      // Optional: You might want to delete the user or tell them to "Resend"
    }

    res.status(201).json({
      success: true,
      message:
        "User registered. Please check your email for verification code.",
      data: { email: savedUser.email }, // Minimize data sent back
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to register",
      error: err.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: err.message,
    });
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // 1. Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check Verification Status
    if (!user.isVerified) {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = newCode;
      await user.save();
      await sendEmail(user.email, newCode);

      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // 3. Check Password
    if (!user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any },
    );

    // Return Success Response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userResponse, // This matches what NextAuth authorize() expects
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Request Password Reset
const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationCode = resetCode; // Reusing this field
    await user.save();

    await sendEmail(email, `Your password reset code is: ${resetCode}`);

    res
      .status(200)
      .json({ success: true, message: "Reset code sent to email" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Reset Password
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid code or email" });
    }

    // Update password (the pre-save hook in your model will hash this automatically)
    user.password = newPassword;
    user.verificationCode = undefined; // Clear the code
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login user with Google
const googleLogin = async (req: Request, res: Response) => {
  try {
    let { email, name, image } = req.body;

    // ✅ FIX: fallback name
    if (!name) {
      name = email.split("@")[0]; // fallback নাম
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);

      user = await User.create({
        email,
        name,
        password: randomPassword,
        profileImg: image,
        isVerified: true,
        role: "client",
      });
    } else {
      user.isVerified = true;

      if (image) user.profileImg = image;
      if (name) user.name = name;

      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any },
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
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


// Helper function to upload image buffer to Cloudinary
const streamUpload = (buffer: Buffer) => {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profiles" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;

    let imageUrl;

    // ✅ upload to cloudinary
    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        ...(imageUrl && { profileImg: imageUrl }),
      },
      { returnDocument: 'after' }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: {
        name: updatedUser?.name,
        image: updatedUser?.profileImg,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const userControllers = {
  register,
  login,
  getUsers,
  googleLogin,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
