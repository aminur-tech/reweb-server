import { Request, Response } from "express";
import { Service } from "../models/service,model";


export const createService = async (req: Request, res: Response) => {
  try {
    // This 'user' comes directly from the middleware we fixed above
    const user = (req as any).user; 

    if (!user || !user.id) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    // Create the service using the ID from the TOKEN (Secure)
    const service = await Service.create({ 
      ...req.body, 
      createdBy: user.id 
    });

    res.status(201).json({ success: true, data: service });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all services
const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find();
    res.status(200).json({ success: true, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch services", error: err.message });
  }
};

// Update service (Admin only)
const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    res.status(200).json({ success: true, message: "Service updated", data: service });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to update service", error: err.message });
  }
};

// Delete service (Admin only)
const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Service deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to delete service", error: err.message });
  }
};

export const serviceControllers = {
  createService,
  getServices,
  updateService,
  deleteService,
};