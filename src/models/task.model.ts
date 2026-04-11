import { Schema, model } from "mongoose";
import { ITask } from "../types/task.interface";

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    category: { type: String },
    clientEmail: { type: String },
    clientName: { type: String },
    clientImage: { type: String },
    companyName: { type: String },
    address: { type: String },

    // ... client info fields ...

    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborator: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["pending", "assigned", "accepted", "rejected", "completed", "delivered"],
      default: "pending",
    },

    // ✅ Separated Storage
    clientAttachments: [{ type: String }], // Requirements/Initial files from Client
    requirementInfo: { type: String}, // Additional field for requirements 

    workAttachments: [{ type: String }],   // Completed files from Collaborator
    workInfo: { type: String },  

    clientFeedback: { type: String },
    ClientRating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);