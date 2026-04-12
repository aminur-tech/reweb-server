interface INotification {
  user: string; // Changed to string to support "admin_room"
  message: string;
  taskId?: string;
  isRead?: boolean;
}

export default INotification;