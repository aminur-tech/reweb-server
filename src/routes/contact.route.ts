import express from 'express';
import { contactControllers } from '../controllers/contact.controller';

const router = express.Router();

router.post('/send-email', contactControllers.sendContactEmail);

export const ContactRoutes = router;