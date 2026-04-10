import { Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  email: string;
  image?: string;
  userName: string;
  rating: number;
  comment: string;
}

export interface IProject {
  title: string;
  description: string;
  thumbnail?: string;
  liveLink?: string;
  frontendRepo?: string;
  backendRepo?: string;
  category: string;
  technologies: string[];
  reviews: IReview[];
  averageRating: number;
}




