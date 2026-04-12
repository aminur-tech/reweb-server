import { Router } from 'express';
import { TaskController } from '../controllers/task.control';
import { isAdmin, isAuth } from '../middleware/auth';
import { upload } from '../middleware/multer';

const router = Router();
// client routes
router.post('/', isAuth,upload.array('files'), TaskController.createTask);
router.get('/my', isAuth, TaskController.getMyTasks);
router.delete('/my/:id', isAuth, TaskController.deleteTask);
router.post('/client/feedback/:id', isAuth, TaskController.giveFeedback);
router.get("/notifications", isAuth, TaskController.getNotifications);
router.patch("/notifications/read", isAuth, TaskController.markAsRead);
router.get('/analytics', isAuth, TaskController.getTaskAnalytics);

// collaborator routes
router.get('/collaborator/my-assignments', isAuth, TaskController.getCollaboratorTasks);
router.patch('/collaborator/status/:id', isAuth, TaskController.updateStatus);
router.delete('/collaborator/:id', isAuth, TaskController.deleteTask);
router.post('/collaborator/submit/:id', isAuth, upload.array('files'), TaskController.submitTask);

// admin routes
router.get('/', isAdmin, TaskController.getAllTasks);
router.get('/unassigned', isAdmin, TaskController.getUnassignedTasks);
router.patch('/assign', isAdmin, TaskController.assignTask);
router.patch('/status/:id', isAuth, TaskController.updateStatus);
router.delete('/:id', isAdmin, TaskController.deleteTaskAdmin);


export default router;

export const TaskRoutes = router;