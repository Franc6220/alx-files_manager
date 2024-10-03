import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';

class UsersController {
	/**
	 * POST /users - Create a new user
	 * @param {Object} req - The request object containing email and password
	 * @param {Object} res - The response object
	 * @returns {void}
	 */
	static async postNew(req, res) {
		const { email, password } = req.body;

		// Check if email is provided
		if (!email) {
			return res.status(400).json({ error: 'Missing email' });
		}

		// Check if password is provided
		if (!password) {
			return res.status(400).json({ error: 'Missing password' });
		}

		// Check if user with the same email already exists
		const existingUser = await dbClient.db.collection('users').findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: 'Already exist' });
		}

		// Hash the password using SHA1
		const hashedPassword = sha1(password);

		// Insert new user into the database
		const newUser = {
			email,
			password: hashedPassword,
		};

		try {
			const result = await dbClient.db.collection('users').insertOne(newUser);
			return res.status(201).json({
				id: result.insertedId,
				email: newUser.email,
			});
		} catch (err) {
			console.error('Error inserting user', err);
			return res.status(500).json({ error: 'Error inserting user' });
		}
	}

	/** GET /users/me - Retrieve the current user based on the token
	 * @param {Object} req - The request object
	 * @param {Object} res - The response object
	 * @returns {void}
	 */
	static async getMe(req, res) {
		const token = req.header('X-Token');
		if (!token) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		// Find the user ID from Redis
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		// Retrieve user details from MongoDB using ObjectId
		try {
			const user = await dbClient.db.collection('users').findOne({ _id: new ObjectID(userId) });
			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			return res.status(200).json({ id: user._id, email: user.email });
		} catch (err) {
			console.error('Error retrieving user', err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
}

export default UsersController;
