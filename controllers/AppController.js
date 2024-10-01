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
			// Logging for debugging
			console.log("Fetching users and files count...");

			const usersCount = await db.client.nbUsers();
			const filesCount = await db.client.nbFiles();

			// Logging the fetched values
			console.log(`Users count: ${usersCount}, Files count: ${filesCount}`);

			res.status(200).json({ users: usersCount, files: filesCount });
		} catch (error) {
			console.error('Error fetching statistics:', error);
			res.status(500).json({ error: 'Unable to fetch statistics' });
		}
	}
}

export default AppController;
