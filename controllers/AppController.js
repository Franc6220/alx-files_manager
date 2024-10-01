import redisClient from '../utils/redis';
import { getDB } from '../utils/db';

class AppController {
	// GET /status - Returns the status of Redis and MongoDB
	static getStatus(req, res) {
		const isRedisAlive = redisClient.isAlive();
		const db = getDB();
		const isDbAlive = !!db;

		res.status(200).json({ redis: isRedisAlive, db: isDbAlive });
	}

	// GET /stats - Returns the count of users and files
	static async getStats(req, res) {
		const db = getDB();

		try {
			const usersCount = await db.collection('users').countDocuments();
			const filesCount = await db.collection('files').countDocuments();

			res.status(200).json({ users: usersCount, files: filesCount });
		} catch (error) {
			res.status(500).json({ error: 'Unable to fetch statistics' });
		}
	}
}

export default AppController;
