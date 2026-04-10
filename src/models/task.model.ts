import { Schema, model } from "mongoose";
import { ITask } from "../types/task.interface";

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },

    // ✅ Client Info (snapshot)
    clientName: { type: String },
    clientEmail: { type: String },
    clientImage: { type: String },
    companyName: { type: String },
    address: { type: String },

    // 🔐 روابط
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborator: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "accepted",
        "rejected",
        "completed",
        "delivered",
      ],
      default: "pending",
    },

    // ✅ FIXED
    attachments: [{ type: String }],

    submissionUrl: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);