import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
	// GET /connect - Authenticate and generate a token
	static async getConnect(req, res) {
		try {
			const authHeader = req.header('Authorization');
			if (!authHeader || !authHeader.startsWith('Basic ')) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			// Decode Base64 credentials
			const base64Credentials = authHeader.split(' ')[1];
			const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
			const [email, password] = credentials.split(':');
			
			// Check if email and password are present
			if (!email || !password) {
				return res.status(401).json({ error: 'Unauthorized - Missing credentials' });
			}
			
			// Hash the password
			const hashedPassword = sha1(password);

			// Find the user in the database
			const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
			if (!user) {
				return res.status(401).json({ error: 'Unauthorized - Invalid credentials' });
			}

			// Generate a token and store it in Redis
			const token = uuidv4();
			const key = `auth_${token}`;
			
			// Store token with expiration of 24 hours (86400 seconds)
			await redisClient.setex(key, user._id.toString());

			// Return the generated token
			return res.status(200).json({ token });
		} catch (error) {
			console.error('Error in getConnect:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	// GET /disconnect - Sign out user and remove the token from Redis
	static async getDisconnect(req, res) {
		try {
			const token = req.header('X-Token');
			if (!token) {
				return res.status(401).json({ error: 'Unauthorized - Missing token' });
			}

			// Delete the token in Redis
			const tokenKey = `auth_${token}`;
			const tokenDeleted = await redisClient.del(tokenKey);

			if (tokenDeleted === 0) {
				return res.status(401).json({ error: 'Unauthorized - Invalid token' });
			}

			return res.status(204).send();
		} catch (error) {
			console.error('Error in getDisconnect:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
}

export default AuthController;
