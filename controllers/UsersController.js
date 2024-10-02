import dbClient from '../utils/db';
import sha1 from 'sha1';

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
}

export default UsersController;
