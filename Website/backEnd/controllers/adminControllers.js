const AdminModel = require('../models/adminModel');
const AdminView = require('../views/adminView');

class AdminController {

  async getInstructorSchedule(req, res) {
    try {
      const { instructorName } = req.params;

      if (!instructorName) {
        return res.status(400).json(AdminView.formatErrorResponse('Instructor name is required.'));
      }

      const result = await AdminModel.getInstructorSchedule(instructorName);

      if (!result.success) {
        return res.status(404).json(AdminView.formatErrorResponse('Instructor schedule not found.'));
      }

      return res.status(200).json(AdminView.formatSuccessResponse('Instructor schedule fetched successfully.', result.schedules));
    } catch (error) {
      console.error(`❌ Error fetching schedule for instructor ${req.params.instructorName}:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to fetch instructor schedule.'));
    }
  }
  async saveSchedule(req, res) {
    try {
      const { columns, rows } = req.body;

      if (!columns?.length || !rows?.length) {
        return res.status(400).json(AdminView.formatErrorResponse('No data to save. Please upload and edit the Excel data.'));
      }

      const academicYear = rows[0]?.[0] || 'Unknown Year';
      const semester = rows[1]?.[0] || 'Unknown Semester';
      const curriculum = rows[3]?.[1] || 'Unknown Curriculum';

      const savedCourses = await Promise.all(
        rows.slice(3).map((row, index) =>
          AdminModel.saveSchedule(academicYear, semester, curriculum, row, index + 3)
        )
      );

      return res.status(200).json(AdminView.formatSuccessResponse('Excel data saved successfully.', savedCourses));
    } catch (error) {
      console.error('❌ Error saving Excel data:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to save Excel data.'));
    }
  }

  async deleteInstructorByName(req, res) {
    try {
      const { instructorName } = req.params;
  
      if (!instructorName) {
        return res.status(400).json(AdminView.formatErrorResponse('Instructor name is required.'));
      }
  
      const result = await AdminModel.deleteInstructorByName(instructorName);
  
      if (!result.success) {
        return res.status(404).json(AdminView.formatErrorResponse('Instructor not found.'));
      }
  
      return res.status(200).json(AdminView.formatSuccessResponse('Instructor deleted successfully.', result));
    } catch (error) {
      console.error(`❌ Error deleting instructor ${req.params.instructorName}:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to delete instructor.'));
    }
  }
  
  
  async deleteAcademicYear(req, res) {
    try {
      const { academicYear } = req.params;

      if (!academicYear) {
        return res.status(400).json(AdminView.formatErrorResponse('Academic year is required.'));
      }

      const result = await AdminModel.deleteAcademicYear(academicYear);
      return res.status(200).json(AdminView.formatSuccessResponse('Academic year deleted successfully.', result));
    } catch (error) {
      console.error(`❌ Error deleting academic year ${req.params.academicYear}:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to delete academic year.'));
    }
  }
  
  async getSchedule(req, res) {
    try {
      const scheduleData = await AdminModel.getAllSchedules();
      return res.status(200).json(AdminView.formatSuccessResponse('Schedules fetched successfully.', scheduleData));
    } catch (error) {
      console.error('❌ Error fetching schedule:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to fetch schedule data.'));
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await AdminModel.getAllUser(); // Now returns both faculty & admins
      return res.status(200).json(AdminView.formatSuccessResponse('Users fetched successfully.', users));
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to fetch users.'));
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(AdminView.formatErrorResponse('User ID is required.'));
      }

      const user = await AdminModel.getUserById(id);

      if (!user) {
        return res.status(404).json(AdminView.formatErrorResponse('User not found.'));
      }

      return res.status(200).json(AdminView.formatSuccessResponse('User fetched successfully.', user));
    } catch (error) {
      console.error(`❌ Error fetching user with ID ${req.params.id}:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to fetch user data.'));
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(AdminView.formatErrorResponse('User ID is required.'));
      }

      const deletedUser = await AdminModel.deleteUser(id);

      if (!deletedUser) {
        return res.status(404).json(AdminView.formatErrorResponse('User not found or already deleted.'));
      }

      return res.status(200).json(AdminView.formatSuccessResponse('User deleted successfully.', deletedUser));
    } catch (error) {
      console.error(`❌ Error deleting user with ID ${req.params.id}:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to delete user.'));
    }
  }

  async editUser(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      if (!id) {
        return res.status(400).json(AdminView.formatErrorResponse('User ID is required.'));
      }
  
      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json(AdminView.formatErrorResponse('No update data provided.'));
      }
  
      const updatedUser = await AdminModel.editUser(id, updatedData);
  
      if (!updatedUser) {
        return res.status(404).json(AdminView.formatErrorResponse('User not found or not updated.'));
      }
  
      return res.status(200).json(AdminView.formatSuccessResponse('User updated successfully.', updatedUser));
    } catch (error) {
      console.error(`❌ Error updating user with ID ${req.params.id}:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to update user.'));
    }
  }
  


  
}

module.exports = new AdminController();
