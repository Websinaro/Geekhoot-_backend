import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Get Admin Stats
router.get('/stats', protect, adminOnly, adminController.getStats);

// Get Unified Inventory Stock Logs
router.get('/inventory/history', protect, adminOnly, adminController.getInventoryHistory);

export default router;
