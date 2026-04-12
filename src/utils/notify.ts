import { io } from "../server";
import { Notification } from "../models/notification.model";

export const sendNotification = async (
  userId: string,
  message: string,
  taskId: string
) => {
  // Save in DB
  await Notification.create({
    user: userId,
    message,
    taskId,
  });

  // Real-time send
  io.to(userId).emit("notification", {
    message,
    taskId,
  });
};