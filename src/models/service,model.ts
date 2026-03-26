import { Schema, model } from "mongoose";
import { IService } from "../types/service.interface";

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    createdBy: { type: String, required: true }, 
  },
  { timestamps: true }
);

export const Service = model<IService>("Service", serviceSchema);