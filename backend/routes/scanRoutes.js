const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

router.get('/', scanController.getAllScans);
router.get('/metrics', scanController.getDashboardMetrics);
router.get('/:id', scanController.getScanById);

module.exports = router;
