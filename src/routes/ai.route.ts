import express from 'express';
import { aiControllers } from '../controllers/ai.controller';

const router = express.Router();

router.post('/generate-chart', aiControllers.consultService);
router.post('/consult', aiControllers.consultService);

export const AIRoutes = router;