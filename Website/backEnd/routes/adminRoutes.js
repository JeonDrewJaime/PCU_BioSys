const express = require('express');
const AdminController = require('../controllers/adminControllers');

const router = express.Router();

// Schedule Routes
router.post('/schedule/save-excel', AdminController.saveSchedule);
router.get('/schedule', AdminController.getSchedule);
router.delete('/academic-years', AdminController.deleteAcademicYears);
router.get('/instructor-schedule/:instructorName', AdminController.getInstructorSchedule);
router.delete('/academic-years/semesters', AdminController.deleteSemesters);
// Instructor Routes
router.delete('/instructors', AdminController.deleteCoursesByInstructorNames);
router.put('/courses/edit-course-details', AdminController.editCourseDetails);
router.post('/courses/by-instructors', AdminController.getCoursesByInstructorNames);
router.put('/courses/update-instructor', AdminController.updateCourseAndInstructorName);
router.delete('/courses/deletes', AdminController.deleteMultipleCoursesByIndex);

router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.delete('/delete', AdminController.deleteMultipleUsers);
router.put('/edit/:id', AdminController.editUser); // Updated route for consistency
module.exports = router;