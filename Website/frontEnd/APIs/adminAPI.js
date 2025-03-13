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
export const fetchUserById = async (userId) => {
  try {
    const { data } = await adminAPI.get(`/users/${userId}`);
    return data?.data || null;
  } catch (error) {
    console.error(`❌ Error fetching user with ID ${userId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user data.');
  }
};

export const deleteUser = async (userId) => {
  try {
    const { data } = await adminAPI.delete(`/delete/${userId}`);
    return data;
  } catch (error) {
    console.error(`❌ Error deleting user with ID ${userId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete user.');
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
