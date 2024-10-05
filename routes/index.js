import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Define routes and map them to controller methods
router.get('/status', AppController.getStatus);

// Task 2: Stats route
router.get('/stats', AppController.getStats);

// New route for creating users
router.post('/users', UsersController.postNew);

// Task 4: Authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// File management
router.post('/files', FilesController.postUpload);

export default router;
