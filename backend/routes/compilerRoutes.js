const express = require('express');
const router = express.Router();
const compilerController = require('../controllers/compilerController');

router.post('/compile', compilerController.compileAndScan);

module.exports = router;
