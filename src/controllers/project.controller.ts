import { Request, Response } from "express";
import { Project } from "../models/project.model";

// Admin: Create Project
const createProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// User/Public: Get All Projects
const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort("-createdAt");
    res.status(200).json({ success: true, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// User/Public: Get Project by ID
const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Admin: Update Project
const updateProject = async (req: Request, res: Response) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Delete Project
const deleteProject = async (req: Request, res: Response) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, userName } = req.body;
    
    // Extract user data from Auth Middleware (ensure your middleware provides this)
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email; // Get email from token/session

    if (!userId) {
      return res.status(401).json({ success: false, message: "Auth required." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Not found" });

    const newReview = {
      user: userId,
      email: userEmail || "guest@dev.com", // Ensure this exists to satisfy Schema
      userName: userName || "Guest Developer",
      rating: Number(rating),
      comment
    };

    project.reviews.push(newReview as any);
    
    const totalRating = project.reviews.reduce((sum, item) => sum + item.rating, 0);
    project.averageRating = totalRating / project.reviews.length;

    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    console.error("Backend Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};




export const projectControllers = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addReview
};