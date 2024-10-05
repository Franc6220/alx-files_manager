import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { promisify } from 'util';
import mime from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

const writeFileAsync = promisify(fs.writeFile);

class FilesController {
	// POST /files - Upload new file
	static async postUpload(req, res) {
		const token = req.header('X-token');
		if (!token) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		// Retrieve user from token
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const { name, type, parentId = 0, isPublic = false, data } = req.body;

		// Validate file creation requirements
		if (!name) {
			return res.status(400).json({ error: 'Missing name' });
		}

		if (!['folder', 'file', 'image'].includes(type)) {
			return res.status(400).json({ error: 'Missing type' });
		}

		if (type !== 'folder' && !data) {
			return res.status(400).json({ error: 'Missing data' });
		}

		// Check for parent folder existence if parentId is provided
		if (parentId !== 0) {
			const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
			if (!parentFile) {
				return res.status(400).json({ error: 'Parent not found' });
			}
			if (parentFile.type !== 'folder') {
				return res.status(400).json({ error: 'Parent is not in folder' });
			}
		}

		// Handle folder creation
		if (type === 'folder') {
			const newFolder = {
				userId: ObjectId(userId),
				name,
				type,
				isPublic,
				parentId: parentId === 0 ? '0' : ObjectId(parentId),
			};

			const result = await dbClient.db.collection('files').insertOne(newFolder);
			return res.status(201).json({
				id: result.insertedId,
				userId,
				name,
				type,
				isPublic,
				parentId,
			});
		}

		// For file and image, handle data storage
		const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}

		// Generate a unique filename and store the file
		const fileUUID = uuidv4();
		const localPath = `${folderPath}/${fileUUID}`;

		try {
			const decodedData = Buffer.from(data, 'base64');
			await writeFileAsync(localPath, decodedData);

			const newFile = {
				userId: ObjectId(userId),
				name,
				type,
				isPublic,
				parentId: parentId === 0 ? '0' : ObjectId(parentId),
				localPath,
			};

			const result = await dbClient.db.collection('files').insertOne(newFile);
			return res.status(201).json({
				id: result.insertedId,
				userId,
				name,
				type,
				isPublic,
				parentId,
			});
		} catch (error) {
			console.error('Error saving file', error);
			return res.status(500).json({ error: 'Error saving file' });
		}
	}
}

export default FilesController;
