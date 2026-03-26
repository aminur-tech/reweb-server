import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";
import { User } from "../models/user.model";

// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const savedUser = await User.create(req.body);

    // Generate token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, role: savedUser.role }, // include id!
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any },
    );

    // Omit password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
      token,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: err.message,
    });
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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
      message: "User logged in successfully",
      token,
      data: userResponse,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: err.message,
    });
  }
};

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
  updateProfile
};
