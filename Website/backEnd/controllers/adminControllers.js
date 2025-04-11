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


  async editCourseDetails(req, res) {
    try {
      const { instructorNames, academicYear, semester, updatedCourseData } = req.body;

      // Validate input
      if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester || !updatedCourseData) {
        return res.status(400).json(AdminView.formatErrorResponse('Instructor names (array), academic year, semester, and updated course data are required.'));
      }

      // Call the model method to edit course details
      const result = await AdminModel.editCourseDetails(instructorNames, academicYear, semester, updatedCourseData);

      // Return success response
      return res.status(200).json(AdminView.formatSuccessResponse('Courses updated successfully for the instructors.', result));
    } catch (error) {
      console.error('❌ Error editing course details:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to edit course details.'));
    }
  }

  async deleteCoursesByInstructorNames(req, res) {
    try {
      const { instructorNames, academicYear, semester } = req.body;
  
      // Validate input
      if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester) {
        return res.status(400).json(AdminView.formatErrorResponse('Instructor names (array), academic year, and semester are required.'));
      }
  
      // Call the model method to delete courses by instructor names
      const result = await AdminModel.deleteCoursesByInstructorNames(instructorNames, academicYear, semester);
  
      // Return success response
      return res.status(200).json(AdminView.formatSuccessResponse('Courses deleted successfully for the instructors.', result));
    } catch (error) {
      console.error('❌ Error deleting courses by instructor names:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to delete courses by instructor names.'));
    }
  }
  
  
  
  async deleteSemesters(req, res) {
    try {
      const { academicYear, semesters } = req.body;
  
      if (!academicYear || !Array.isArray(semesters) || semesters.length === 0) {
        return res.status(400).json(AdminView.formatErrorResponse('Academic year and semesters are required.'));
      }
  
      const result = await AdminModel.deleteSemesters(academicYear, semesters);
      return res.status(200).json(AdminView.formatSuccessResponse('Semesters deleted successfully.', result));
    } catch (error) {
      console.error(`❌ Error deleting semesters:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to delete semesters.'));
    }
  }

  
  
  async deleteAcademicYears(req, res) {
    try {
      const { academicYears } = req.body;
  
      if (!Array.isArray(academicYears) || academicYears.length === 0) {
        return res.status(400).json(AdminView.formatErrorResponse('A list of academic years is required.'));
      }
  
      const result = await AdminModel.deleteAcademicYears(academicYears);
      return res.status(200).json(AdminView.formatSuccessResponse('Academic years deleted successfully.', result));
    } catch (error) {
      console.error(`❌ Error deleting academic years:`, error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to delete academic years.'));
    }
  }


 
  async deleteMultipleCoursesByIndex(req, res) {
    try {
      const { courseIndices, academicYear, semester } = req.body;
  
      // Validate request body parameters
      if (
        !Array.isArray(courseIndices) || 
        courseIndices.length === 0 || 
        !academicYear || 
        !semester
      ) {
        return res.status(400).json(AdminView.formatErrorResponse('Missing or invalid required parameters.'));
      }
  
      // Call model/service to delete the selected courses
      const result = await AdminModel.deleteMultipleCoursesByIndex(courseIndices, academicYear, semester);
  
      // Return success response
      return res.status(200).json(AdminView.formatSuccessResponse('Selected courses deleted successfully.', result));
    } catch (error) {
      console.error('❌ Error deleting multiple courses:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Error occurred while deleting the selected courses.'));
    }
  }
  
  

  async updateCourseAndInstructorName(req, res) {
    try {
      const { courses, academicYear, semester, instructorName } = req.body;
  
      // Validate request body parameters
      if (!Array.isArray(courses) || courses.length === 0 || !academicYear || !semester || !instructorName) {
        return res.status(400).json(AdminView.formatErrorResponse('Invalid parameters.'));
      }
  
      // Call model to update each course and instructor schedule
      const updatedCourses = await AdminModel.updateCoursesAndInstructorNames(
        courses, 
        academicYear, 
        semester, 
        instructorName
      );
  
      // Return a success response
      return res.status(200).json(AdminView.formatSuccessResponse('Courses updated successfully with schedule changes', updatedCourses));
    } catch (error) {
      console.error('❌ Error updating course and instructor name:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Error occurred while updating the courses.'));
    }
  }
  
  async getCoursesByInstructorNames(req, res) {
    try {
      const { instructorNames, academicYear, semester } = req.body;
  
      if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester) {
        return res.status(400).json(AdminView.formatErrorResponse('Instructor names (array), academic year, and semester are required.'));
      }
  
      const result = await AdminModel.getCoursesByInstructorNames(instructorNames, academicYear, semester);
  
      if (!result.success || result.courses.length === 0) {
        return res.status(404).json(AdminView.formatErrorResponse('No courses found for the given instructors.'));
      }
  
      return res.status(200).json(AdminView.formatSuccessResponse('Courses fetched successfully for the instructors.', result.courses));
    } catch (error) {
      console.error('❌ Error fetching courses by instructor names:', error);
      return res.status(500).json(AdminView.formatErrorResponse('Failed to fetch courses by instructor names.'));
    }
  }
  

  

  async updateCourseAndDeleteInstructor(req, res) {
    try {
      const { courseIndex, academicYear, semester, instructorName, newCourseData } = req.body;
  
      if (!courseIndex || !academicYear || !semester || !instructorName || !newCourseData) {
        return res.status(400).json(AdminView.formatErrorResponse('Invalid parameters provided.'));
      }
  
      // Call the model method to update the course and delete the instructor
      const result = await AdminModel.updateCourseAndDeleteInstructor(courseIndex, academicYear, semester, instructorName, newCourseData);
  
      if (result.success) {
        return res.status(200).json(AdminView.formatSuccessResponse('Course updated and instructor removed successfully.', result.course));
      } else {
        return res.status(400).json(AdminView.formatErrorResponse(result.message));
      }
    } catch (error) {
      console.error('❌ Error in updateCourseAndDeleteInstructor:', error);
      return res.status(500).json(AdminView.formatErrorResponse('An error occurred while updating the course and deleting the instructor.'));
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

  async deleteMultipleUsers(req, res) {
  try {
    const { userIds } = req.body;  // Array of user IDs to be deleted

    // Validate that the userIds are provided and are in an array format
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json(AdminView.formatErrorResponse('Please provide an array of user IDs.'));
    }

    // Call the model's deleteUsers method to delete the users
    const result = await AdminModel.deleteUsers(userIds);

    // Check if the deletion was successful
    if (result && result.message) {
      return res.status(200).json(AdminView.formatSuccessResponse(result.message, result));
    } else {
      return res.status(404).json(AdminView.formatErrorResponse('No users were deleted.'));
    }
  } catch (error) {
    console.error("❌ Error deleting multiple users:", error);
    return res.status(500).json(AdminView.formatErrorResponse('Failed to delete users.'));
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