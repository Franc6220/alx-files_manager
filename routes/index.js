import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = express.Router();

// Define routes and map them to controller methods
router.get('/status', AppController.getStatus);

// Task 2: Stats route
router.get('/stats', AppController.getStats);

// New route for creating users
router.post('/users', UsersController.postNew);

export default router;
