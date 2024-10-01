import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/files_manager';
let db = null;

const connectDB = async () => {
	if (!db) {
		try {
			const client = await MongoClient.connect(mongoUri, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			db = client.db();
			console.log('Connected to MongoDB');
		} catch (error) {
			console.error('MongoDB connection error:', error);
			throw new Error('MongoDB connection failed');
		}
	}
	return db;
};

// Function to get the DB instance
const getDB = () => db;

export { connectDB, getDB };
