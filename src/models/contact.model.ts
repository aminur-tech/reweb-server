import { Schema, model } from 'mongoose';
import { IContact } from '../types/contact.interface';

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export const Contact = model<IContact>('Contact', contactSchema);