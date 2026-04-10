import express from 'express';
import { userControllers } from '../controllers/user.controller';
import { isAdmin, isAuth } from '../middleware/auth';
import { upload } from '../middleware/multer';


const router = express.Router();

// Register user
router.post('/register', userControllers.register);
// Verify email
router.post('/verify-email', userControllers.verifyEmail);
// Login user
router.post('/login', userControllers.login);
// Forgot password
router.post('/forgot-password', userControllers.forgotPassword);
// Reset password   
router.post('/reset-password', userControllers.resetPassword);
// Google Login user
router.post('/google', userControllers.googleLogin);
// Get all users
router.get('/users', userControllers.getUsers);
// Update user profile
router.patch('/update-profile',isAuth, upload.single("image"), userControllers.updateProfile);

router.get('/collaborators', isAdmin, userControllers.getCollaborators);


export const UserRoutes = router;


