const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/profile', studentController.getProfile);

module.exports = router;
