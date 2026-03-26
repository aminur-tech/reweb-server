import { Schema, model } from 'mongoose';
import { ITechStack } from '../types/techstack.interface';

const techStackSchema = new Schema<ITechStack>({
  title: { type: String, required: true },
  sector: { type: String, required: true }, // Filter field
  description: { type: String },
  icon: { type: String }, // Can be a Lucide icon name or image URL
}, { timestamps: true });

export const TechStack = model<ITechStack>('TechStack', techStackSchema);