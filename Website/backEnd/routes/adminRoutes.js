const express = require('express');
const AdminController = require('../controllers/adminControllers'); 

const router = express.Router();

router.post('/save-excel', AdminController.saveExcelData);
router.get('/schedule', AdminController.getSchedule);

module.exports = router;
