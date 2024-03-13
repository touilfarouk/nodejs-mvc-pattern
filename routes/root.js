import express from 'express';
const router = express.Router();
import { fileURLToPath } from 'url';
// Adjusted to use import.meta.url to get the directory path
const __dirname = fileURLToPath(import.meta.url);
import path from 'path';
import fsPromises from 'fs/promises';

router.get('/', async (req, res) => {
    try {
        // Adjusted path to read the file correctly
        const filePath = path.join(__dirname, '..', 'model', 'users.json');
        const data = await fsPromises.readFile(filePath, 'utf-8');
        const users = JSON.parse(data);
        res.json(users);
    } catch (err) {
        console.error(`Failed to load users database: ${err}`);
        res.status(500).json({ error: 'Failed to load users database' });
    }
});

export default router;
