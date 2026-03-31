import { Schema, model } from 'mongoose';
import { IProject, IReview } from '../types/project.interface';

const ReviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  userName: { type: String, required: true },
  image: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  liveLink: { type: String },
  frontendRepo: { type: String },
  backendRepo: { type: String },
  technologies: [{ type: String }],
  category: { type: String, required: true },
  reviews: [ReviewSchema],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

export const Project = model<IProject>('Project', ProjectSchema);