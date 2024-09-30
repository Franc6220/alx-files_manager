import { MongoClient } from 'mongodb';

class DBClient {
	constructor() {
		const host = process.env.DB_HOST || 'localhost';
		const port = process.env.DB_PORT || 27017;
		const database = process.env.DB_DATABASE || 'files_manager';

		const url = `mongodb://${host}:${port}`;
		this.client = new MongoClient(url, { useUnifiedTopology: true });

		this.client.connect().then(() => {
			console.log('Connected to MongoDB');
			this.db = this.client.db(database);
		}).catch((err) => {
			console.error(`MongoDB connection error: ${err.message}`);
			throw new Error('MongoDB connection failed');
		});
	}

	// Check if MonogDB client is connected
	isAlive() {
		return this.client && this.client.topology && this.client.topology.isConnected();
	}

	//Get the number of users in the 'users' collection
	async nbUsers() {
		try {
			const count = await this.db.collection('users').countDocuments();
			return count;
		} catch (err) {
			console.error(`Error getting number of users: ${err.message}`);
			return 0;
		}
	}

	// Get the number of files in the 'files' collection
	async nbFiles() {
		try {
			const count = await this.db.collection('files').countDocuments();
			return count;
		} catch (err) {
			console.error(`Error getting number of files: ${err.message}`);
			return 0;
		}
	}
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
