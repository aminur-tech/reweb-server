import { Router } from 'express';
import { TaskController } from '../controllers/task.control';
import { isAdmin, isAuth } from '../middleware/auth';
import { upload } from '../middleware/multer';

const router = Router();
// client routes
router.post('/', isAuth,upload.array('files'), TaskController.createTask);
router.get('/my', isAuth, TaskController.getMyTasks);
router.patch('/my/:id',upload.array("files"), isAuth, TaskController.updateTask);
router.delete('/my/:id', isAuth, TaskController.deleteTask);
router.get('/analytics', isAuth, TaskController.getTaskAnalytics);

// admin routes
router.get('/', isAdmin, TaskController.getAllTasks);
router.get('/unassigned', isAdmin, TaskController.getUnassignedTasks);
router.patch('/assign', isAdmin, TaskController.assignTask);
router.patch('/status/:id', isAuth, TaskController.updateStatus);
router.delete('/:id', isAdmin, TaskController.deleteTaskAdmin);


export default router;

export const TaskRoutes = router;