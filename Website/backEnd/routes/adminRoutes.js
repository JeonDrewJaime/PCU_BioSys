const express = require('express');
const AdminController = require('../controllers/adminControllers');

const router = express.Router();

// Schedule Routes
router.post('/schedule/save-excel', AdminController.saveSchedule);
router.get('/schedule', AdminController.getSchedule);
router.delete('/schedule/:academicYear', AdminController.deleteAcademicYear);

// User Routes
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.delete('/delete/:id', AdminController.deleteUser); // Updated route for consistency
router.put('/edit/:id', AdminController.editUser); // Updated route for consistency
module.exports = router;
