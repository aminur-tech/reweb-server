import { Schema, model } from 'mongoose';
import INotification from '../types/notification.interface';

const NotificationSchema = new Schema<INotification>({
  user: { 
    type: String, 
    required: true 
  },
  message: { type: String, required: true },
  taskId: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', NotificationSchema);