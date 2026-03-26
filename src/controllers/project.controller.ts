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

// Admin: Update Project
const updateProject = async (req: Request, res: Response) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

// User: Add Review & Recalculate Average
const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, userName } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const newReview = {
      user: (req as any).user.id, // ID from auth middleware
      userName,
      rating: Number(rating),
      comment
    };

    project.reviews.push(newReview as any);
    
    // Calculate Average Rating
    const totalRating = project.reviews.reduce((sum, item) => sum + item.rating, 0);
    project.averageRating = totalRating / project.reviews.length;

    await project.save();
    res.status(201).json({ success: true, message: "Review added", data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const projectControllers = {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  addReview
};