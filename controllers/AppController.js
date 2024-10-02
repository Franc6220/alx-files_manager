import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
	// GET /status - Returns the status of Redis and MongoDB
	static getStatus(req, res) {
		const isRedisAlive = redisClient.isAlive();
		const isDbAlive = dbClient.isAlive();
		res.status(200).json({ redis: isRedisAlive, db: isDbAlive });
	}

	// GET /stats - Returns the count of users and files
	static async getStats(req, res) {
		try {
			// Fetch the number of users and files using dbClient methods
			const usersCount = await dbClient.nbUsers();
			const filesCount = await dbClient.nbFiles();

			res.status(200).json({ users: usersCount, files: filesCount });
		} catch (error) {
			console.error('Error fetching statistics:', error);
			res.status(500).json({ error: 'Unable to fetch statistics' });
		}
	}
}

export default AppController;
