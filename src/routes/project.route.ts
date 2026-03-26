import express from 'express';
import { projectControllers } from '../controllers/project.controller';
import { isAdmin } from '../middleware/auth';
// import { auth, adminOnly } from '../middleware/auth'; // Hypothetical middleware

const router = express.Router();

// Public Routes
router.get('/', projectControllers.getAllProjects);

// User Routes (Requires Login)
router.post('/:id/review', /* auth, */ projectControllers.addReview);

// Admin Routes (Requires Admin Role)
router.post('/create', isAdmin, projectControllers.createProject);
router.patch('/:id', isAdmin, projectControllers.updateProject);
router.delete('/:id', isAdmin, projectControllers.deleteProject);

export const ProjectRoutes = router;