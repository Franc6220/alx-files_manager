import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

// Define routes and map them to controller methods
router.get('/status', AppController.getStatus);

// Task 2: Stats route
router.get('/stats', AppController.getStats);

export default router;
