import express from 'express';
import { connectDB } from './utils/db';
import routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Load routes
app.use('/', routes);

// Connect to MongoDB before starting the server
connectDB().then(() => {
	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
}).catch((error) => {
	console.error('Failed to connect to the database:', error);
});

export default app;
