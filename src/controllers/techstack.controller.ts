import { Request, Response } from 'express';
import { TechStack } from '../models/techstack.model';

// Create a new TechStack item
export const createTechStack = async (req: Request, res: Response) => {
  try {
    const result = await TechStack.create(req.body);
    res.status(201).json({
      success: true,
      message: 'TechStack created successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Create failed', error });
  }
};

// Get all TechStacks (with optional sector filtering)
export const getAllTechStacks = async (req: Request, res: Response) => {
  try {
    const { sector } = req.query;
    const query = sector ? { sector } : {};
    
    const result = await TechStack.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
};

// Update a TechStack item
export const updateTechStack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await TechStack.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: 'TechStack updated successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Delete a TechStack item
export const deleteTechStack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TechStack.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'TechStack deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};