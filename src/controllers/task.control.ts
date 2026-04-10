import { Request, Response } from "express";
import { Task } from "../models/task.model";
import cloudinary from "../config/cloudinary"; // Your cloudinary file

export const TaskController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const { title, description, category, companyName, address } = req.body;
      const files = req.files as Express.Multer.File[];
      const attachmentUrls: string[] = [];

      //  Upload files to Cloudinary if they exist
      if (files && files.length > 0) {
        for (const file of files) {
          const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "task_attachments", resource_type: "auto" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result?.secure_url);
              },
            );
            uploadStream.end(file.buffer);
          });
          const url = await uploadPromise;
          attachmentUrls.push(url as string);
        }
      }

      const user = (req as any).user;

      //  Create Task in Database
      const task = await Task.create({
        title,
        description,
        category,
        clientName: user?.name,
        clientEmail: user?.email,
        clientImage: user?.image,
        companyName,
        address,
        client: user?.id,
        attachments: attachmentUrls,
        status: "pending",
      });

      res.status(201).json({ success: true, data: task });
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

  // update task
  updateTask: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Task ID is required",
        });
      }

      const existingTask = await Task.findById(id);

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      let attachmentUrls: string[] = [...(existingTask.attachments || [])];

      // Upload files safely
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const url: any = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "task_attachments",  resource_type: "auto", },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result?.secure_url);
                },
              );

              uploadStream.end(file.buffer);
            });

            if (url) {
              attachmentUrls.push(url);
            }
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
          }
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
          title: title || existingTask.title,
          description: description || existingTask.description,
          attachments: attachmentUrls,
        },
        { new: true },
      ).populate("collaborator", "name email");

      return res.json({
        success: true,
        data: updatedTask,
      });
    } catch (err: any) {
      console.error("UPDATE TASK ERROR:", err); // 🔥 IMPORTANT
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
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
        $or: [
          { collaborator: { $exists: false } },
          { collaborator: null }
        ]
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


  // 3. Collaborator Accepts/Rejects
  updateStatus: async (req: Request, res: Response) => {
    const { status } = req.body; // e.g., 'accepted' or 'rejected'
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(task);
  },

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
              { $limit: 5 } // Top 5 categories
            ],
            // 3. Total Count
            totalTasks: [
              { $count: "total" }
            ]
          },
        },
      ]);

      // Format data for the Recharts frontend
      const result = {
        statusStats: stats[0].byStatus.map((s: any) => ({
          name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
          value: s.count
        })),
        categoryStats: stats[0].byCategory.map((c: any) => ({
          category: c._id || "Uncategorized",
          count: c.count
        })),
        total: stats[0].totalTasks[0]?.total || 0
      };

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
