import express from 'express';
import { userControllers } from '../controllers/user.controller';


const router = express.Router();

// Register user
router.post('/register', userControllers.register);
// Verify email
router.post('/verify-email', userControllers.verifyEmail);
// Login user
router.post('/login', userControllers.login);
// Google Login user
router.post('/google', userControllers.googleLogin);
// Get all users
router.get('/users', userControllers.getUsers);
// Update user profile
router.patch('/profile', userControllers.updateProfile);


export const UserRoutes = router;


