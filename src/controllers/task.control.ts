import { Request, Response } from "express";
import { Task } from "../models/task.model";
import cloudinary from "../config/cloudinary"; // Your cloudinary file

export const TaskController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const { title, requirementInfo, category, companyName, address } =
        req.body;
      const files = req.files as Express.Multer.File[];
      const attachmentUrls: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const url: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "reweb_requirements", resource_type: "auto" },
              (error, result) =>
                error ? reject(error) : resolve(result?.secure_url),
            );
            stream.end(file.buffer);
          });
          attachmentUrls.push(url);
        }
      }

      const user = (req as any).user;

      const task = await Task.create({
        title,
        category,
        clientName: user?.name,
        clientEmail: user?.email,
        clientImage: user?.image,
        client: user?.id,
        companyName,
        address,
        clientAttachments: attachmentUrls,
        requirementInfo,
        status: "pending",
      });

      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },



  // 1. Collaborator marks as 'completed' (Submits files for Admin review)
  submitTask: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { workInfo } = req.body;
      const files = req.files as Express.Multer.File[];
      const submissionUrls: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const url: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "reweb_submissions", resource_type: "auto" },
              (error, result) => error ? reject(error) : resolve(result?.secure_url)
            );
            stream.end(file.buffer);
          });
          submissionUrls.push(url);
        }
      }

      const task = await Task.findByIdAndUpdate(
        id,
        {
          status: "completed", 
          workInfo,
          $push: { workAttachments: { $each: submissionUrls } },
        },
        { new: true }
      );
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 2. Client gives feedback and rating, marking task as 'delivered'
  giveFeedback: async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      {
        status: "delivered", // final stage
        ClientRating: rating,
        clientFeedback: feedback,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
},

  



  // get my tasks
  getMyTasks: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const tasks = await Task.find({ client: user.id }).populate(
      "collaborator",
      "name email",
    );
    res.json(tasks);
  },

  // delete task
  deleteTask: async (req: Request, res: Response) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Task deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  //  Admin Assigns Collaborator
  assignTask: async (req: Request, res: Response) => {
    const { projectId, collaboratorId } = req.body;
    const task = await Task.findByIdAndUpdate(
      projectId,
      { collaborator: collaboratorId, status: "assigned" },
      { new: true },
    );
    res.json(task);
  },

  getUnassignedTasks: async (req: Request, res: Response) => {
    try {
      // Find tasks where collaborator is null or doesn't exist
      const tasks = await Task.find({
        $or: [{ collaborator: { $exists: false } }, { collaborator: null }],
      });
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // get all tasks (admin)
  getAllTasks: async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find().populate("collaborator", "name email");
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // delete task (admin)
  deleteTaskAdmin: async (req: Request, res: Response) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Task deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // get tasks assigned to collaborator
  getCollaboratorTasks: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const tasks = await Task.find({ collaborator: user.id }).populate(
      "client",
      "name email",
    );
    res.json(tasks);
  },

  //  Collaborator Accepts/Rejects
  updateStatus: async (req: Request, res: Response) => {
    const { status } = req.body; // e.g., 'accepted' or 'rejected'
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(task);
  },

  // Task Analytics for Recharts

  getTaskAnalytics: async (req: Request, res: Response) => {
    try {
      const stats = await Task.aggregate([
        {
          $facet: {
            // 1. Group by Status
            byStatus: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
            // 2. Group by Category
            byCategory: [
              {
                $group: {
                  _id: "$category",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 }, // Top 5 categories
            ],
            // 3. Total Count
            totalTasks: [{ $count: "total" }],
          },
        },
      ]);

      // Format data for the Recharts frontend
      const result = {
        statusStats: stats[0].byStatus.map((s: any) => ({
          name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
          value: s.count,
        })),
        categoryStats: stats[0].byCategory.map((c: any) => ({
          category: c._id || "Uncategorized",
          count: c.count,
        })),
        total: stats[0].totalTasks[0]?.total || 0,
      };

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
