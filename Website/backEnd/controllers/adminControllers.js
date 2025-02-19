const AdminModel = require('../models/adminModel');
const AdminView = require('../views/adminView');

class AdminController {
  async saveExcelData(req, res) {
    try {
      const { columns, rows } = req.body;

      if (!columns.length || !rows.length) {
        return res.status(400).json(AdminView.formatErrorResponse('No data to save. Please upload and edit the Excel data.'));
      }

      const academicYear = rows[0]?.[0] || 'Unknown Year';
      const semester = rows[1]?.[0] || 'Unknown Semester';
      const curriculum = rows[3]?.[1] || 'Unknown Curriculum';

      const savedCourses = [];

      for (let index = 3; index < rows.length; index++) {
        const courseData = await AdminModel.saveCourse(academicYear, semester, curriculum, rows[index], index);
        if (courseData) {
          savedCourses.push(courseData);
        }
      }

      return res.status(200).json(AdminView.formatSuccessResponse('Excel data saved successfully.', savedCourses));
    } catch (error) {
      console.error('Error saving Excel data:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to save Excel data.'));
    }
  }

  async getSchedule(req, res) {
    try {
      const scheduleData = await AdminModel.getAllSchedules(); // ✅ Corrected method call
      return res.json(AdminView.formatSuccessResponse('Schedules fetched successfully', scheduleData));
    } catch (error) {
      console.error('❌ Error fetching schedule:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to fetch schedule data'));
    }
  }
}

module.exports = new AdminController();
