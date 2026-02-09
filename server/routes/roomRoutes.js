const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoom);

module.exports = router;
