import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
	constructor() {
		// Create Redis client
		this.client = createClient();

		// Handle connection errors
		this.client.on('error', (error) => console.error(`Redis client not connected to the server: ${err.message}`));

		// Log when Redis connects successfully
		this.client.on('connect', () => {
			console.log('Redis client connected to the server');
		});

		// Promisify Redis commands for async/await usage
		this.getAsync = promisify(this.client.get).bind(this.client);
		this.delAsync = promisify(this.client.del).bind(this.client);
	}

	// Check if Redis client is connected
	isAlive() {
		return this.client.connected && this.client.ready;
	}

	// Get value by key
	async get(key) {
		try {
			const value = await this.getAsync(key);
			return value;
		} catch (err) {
			console.error(`Error retrieving key ${key}: ${err.message}`);
			return null;
		}
	}

	// Set a key-value pair in Redis with an expiration time in seconds (without promisifying setex)
	async set(key, value, duration) {
		try {
			await new Promise((resolve, reject) => {
				this.client.setex(key, duration, value, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		} catch (err) {
			console.error(`Error setting key ${key} with expiration: ${err.message}`);
		}
	}

	// Delete value by key
	async del(key) {
		try {
			await this.delAsync(key);
		} catch (err) {
			console.error(`Error deleting key ${key}: ${err.message}`);
		}
	}
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
