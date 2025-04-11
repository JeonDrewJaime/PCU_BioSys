import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/admin';

const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch schedule data from the API
 * @returns {Promise<Array>} Resolves with the schedule data
 */


export const fetchScheduleData = async () => {
  try {
    const { data } = await adminAPI.get('/schedule');
    return data?.data || [];
  } catch (error) {
    console.error('❌ Error fetching schedule data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch schedule data.');
  }
};

/**
 * Save Excel data to the API
 * @param {Array} columns - Column headers
 * @param {Array} rows - Data rows
 * @returns {Promise<Object>} Resolves with the API response
 */
export const saveExcelData = async (columns, rows) => {
  try {
    const { data } = await adminAPI.post('/schedule/save-excel', { columns, rows });
    return data;
  } catch (error) {
    console.error('❌ Error saving Excel data:', error);
    throw new Error(error.response?.data?.message || 'Failed to save Excel data.');
  }
};

export const deleteMultipleCourses = async (courseIndices, academicYear, semester) => {
  try {
    const { data } = await adminAPI.delete('/courses/deletes', {
      data: {
        courseIndices,
        academicYear,
        semester,
      }
    });
    return data;
  } catch (error) {
    console.error('❌ Error deleting multiple courses:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete courses.'
    );
  }
};


export const updateCourseAndInstructorName = async (courses, academicYear, semester, instructorName) => {
  try {
    // Make the API request to the backend with the necessary data
    const { data } = await adminAPI.put('courses/update-instructor', { 
      courses, 
      academicYear, 
      semester, 
      instructorName 
    });

    return data;
  } catch (error) {
    console.error('❌ Error updating course and instructor name:', error);
    // Throw an error with a custom message if the request fails
    throw new Error(error.response?.data?.message || 'Failed to update course and instructor data.');
  }
};

/**
 * Fetch instructor schedule by name
 * @param {string} instructorName - The name of the instructor
 * @returns {Promise<Object>} Resolves with the instructor's schedule data
 */
export const fetchInstructorSchedule = async (instructorName) => {
  try {
    const { data } = await adminAPI.get(`/instructor-schedule/${instructorName}`);
    return data?.data || null;
  } catch (error) {
    console.error(`❌ Error fetching schedule for instructor ${instructorName}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch instructor schedule.');
  }
};
/**
 * Fetch all users (faculty & admin)
 * @returns {Promise<Array>} Resolves with the list of users
 */
export const fetchAllUsers = async () => {
  try {
    const { data } = await adminAPI.get('/users');
    return data?.data || [];
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users.');
  }
};

/**
 * Fetch user by ID (faculty or admin)
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object|null>} Resolves with the user data or null if not found
 */

export const deleteSchedule = async (academicYear, semester = null, instructorName = null) => {
  try {
    let url = `/schedule/${academicYear}`;
    if (semester) url += `/${semester}`;
    if (instructorName) url += `/${instructorName}`;

    const { data } = await adminAPI.delete(url);
    return data;
  } catch (error) {
    console.error(`❌ Error deleting ${instructorName ? `instructor ${instructorName} from` : ''} ${semester ? `semester ${semester} in` : ''} academic year ${academicYear}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete schedule.');
  }
};

export const fetchUserById = async (userId) => {
  try {
    const { data } = await adminAPI.get(`/users/${userId}`);
    return data?.data || null;
  } catch (error) {
    console.error(`❌ Error fetching user with ID ${userId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user data.');
  }
};

export const deleteUsers = async (userIds) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs should be an array and cannot be empty.');
    }

    const { data } = await adminAPI.delete('/delete', {
      data: { userIds },  // Sending the userIds array in the request body
    });

    return data;
  } catch (error) {
    console.error(`❌ Error deleting users:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete users.');
  }
};

export const deleteCoursesByInstructorNames = async (instructorNames, academicYear, semester) => {
  try {
    // Validate input
    if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester) {
      throw new Error('Instructor names should be an array, and academic year and semester are required.');
    }

    // Make API request to delete courses by instructor names
    const { data } = await adminAPI.delete('/instructors', {
      data: { instructorNames, academicYear, semester },  // Sending the instructor names, academic year, and semester in the request body
    });

    return data;
  } catch (error) {
    console.error(`❌ Error deleting courses by instructor names:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete courses by instructor names.');
  }
};

export const getCoursesByInstructorNames = async (instructorNames, academicYear, semester) => {
  try {
    // Validate input
    if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester) {
      throw new Error('Instructor names should be an array, and academic year and semester are required.');
    }

    // Make POST request to get matching courses
    const { data } = await adminAPI.post('/courses/by-instructors', {
      instructorNames,
      academicYear,
      semester
    });

    return data;
  } catch (error) {
    console.error(`❌ Error fetching courses by instructor names:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch courses by instructor names.');
  }
};


export const deleteMultipleAcademicYears = async (academicYears) => {
  try {
    const { data } = await adminAPI.delete('/academic-years', {
      data: { academicYears },
    });
    return data;
  } catch (error) {
    console.error('❌ Error deleting multiple academic years:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete multiple academic years.');
  }
};

export const deleteSemesters = async (academicYear, semesters) => {
  try {
    const { data } = await adminAPI.delete('/academic-years/semesters', {
      data: { academicYear, semesters },
    });
    return data;
  } catch (error) {
    console.error(`❌ Error deleting semesters from ${academicYear}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete semesters.');
  }
};

export const editUser = async (userId, updatedData) => {
  try {
    const { data } = await adminAPI.put(`/edit/${userId}`, updatedData);
    return data;
  } catch (error) {
    console.error(`❌ Error updating user with ID ${userId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to update user.');
  }
};

/**
 * Delete a specific academic year
 * @param {string} academicYear - The academic year to delete
 * @returns {Promise<Object>} Resolves with the API response
 */
export const deleteAcademicYear = async (academicYear) => {
  try {
    const { data } = await adminAPI.delete(`/schedule/${academicYear}`);
    return data;
  } catch (error) {
    console.error(`❌ Error deleting academic year ${academicYear}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete academic year.');
  }
};


/**
 * Delete an instructor by name
 * @param {string} instructorName - The name of the instructor to delete
 * @returns {Promise<Object>} Resolves with the API response
 */
export const deleteInstructorByName = async (instructorName) => {
  try {
    const { data } = await adminAPI.delete(`/instructors/${instructorName}`);
    return data;
  } catch (error) {
    console.error(`❌ Error deleting instructor with name ${instructorName}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete instructor.');
  }
};

export default adminAPI;
