import { MongoClient } from 'mongodb';

class DBClient {
	constructor() {
		const host = process.env.DB_HOST || 'localhost';
		const port = process.env.DB_PORT || 27017;
		const database = process.env.DB_DATABASE || 'files_manager';
		const uri = `mongodb://${host}:${port}`;

		// Initialize the MongoDB client and connect to the specified database
		this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		this.dbName = database;

		// Start connection to the MongoDB server
		this.client.connect().then(() => {
			this.db = this.client.db(this.dbName);
			console.log('Connected to MongoDB');
		}).catch((err) => {
			console.error('Failed to connect to MongoDB', err);
			this.db = null;
		});
	}

	/**
	 * Check if MongoDB connection is alive
	 * @returns {boolean} True if connection is active, False otherwise
	 */
	isAlive() {
		return !!this.db;
	}

	/**
	 * Get the number of documents in the 'users' collection
	 * @returns {Promise<number>} Number of users
	 */
	async nbUsers() {
		if (!this.db) {
			console.error('MongoDB is not connected');
			return 0;
		}
		return this.db.collection('users').countDocuments();
	}

	/**
	 * Get the number of documents in the 'files' collection
	 * @returns {Promise<number>} Number of files
	 */
	async nbFiles() {
		if (!this.db) {
			console.error('MongoDB is not connected');
			return 0;
		}
		return this.db.collection('files').countDocuments();
	}

	/**
	 * Getter for the MongoDB database instance
	 * @returns {object} MongoDB database instance
	 */
	get dbInstance() {
		if (!this.db) {
			throw new Error('Database connection not initialized');
		}
		return this.db;
	}
}

// Create and export a single instance of DBClient
const dbClient = new DBClient();
export default dbClient;
