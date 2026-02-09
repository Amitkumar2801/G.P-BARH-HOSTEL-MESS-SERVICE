const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');

router.get('/menu', messController.getMenu);
router.post('/upload', messController.uploadFoodImage);

module.exports = router;
