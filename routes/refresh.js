import express from 'express';
import refreshTokenController from '../controllers/refreshTokenController.js';

const router = express.Router();

router.get('/', refreshTokenController.handleRefreshToken);

export default router;