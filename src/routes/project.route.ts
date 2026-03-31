import express from 'express';
import { projectControllers } from '../controllers/project.controller';
import { isAdmin, isAuth } from '../middleware/auth';


const router = express.Router();

// Public Routes
router.get('/', projectControllers.getAllProjects);
router.get('/:id', projectControllers.getProjectById);

// User Routes (Requires Login)
router.post('/:id/review', isAuth, projectControllers.addReview);

// Admin Routes (Requires Admin Role)
router.post('/create', isAdmin, projectControllers.createProject);
router.patch('/:id', isAdmin, projectControllers.updateProject);
router.delete('/:id', isAdmin, projectControllers.deleteProject);

export const ProjectRoutes = router;