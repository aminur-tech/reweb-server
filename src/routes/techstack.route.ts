import express from 'express';
import { 
  createTechStack, 
  deleteTechStack, 
  getAllTechStacks, 
  updateTechStack 
} from '../controllers/techstack.controller';
import { isAdmin } from '../middleware/auth';


const router = express.Router();

// Public route: View tech stack
router.get('/', getAllTechStacks);

// Protected routes: Admin only
router.post('/', isAdmin, createTechStack);
router.patch('/:id', isAdmin, updateTechStack);
router.delete('/:id', isAdmin, deleteTechStack);

export const TechStackRoutes = router;