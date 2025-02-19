import axios from 'axios';

const ADMIN_URL = 'http://localhost:3000/admin';

const adminAPI = axios.create({
  baseURL: ADMIN_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch schedule data from the API
 * @returns {Promise} - Resolves with the schedule data
 */
export const fetchScheduleData = async () => {
  try {
    const response = await adminAPI.get('/schedule');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    throw error.response?.data || 'Failed to fetch schedule data.';
  }
};

/**
 * Save Excel content to the database
 * @param {Array} columns - Column headers from the Excel file
 * @param {Array} rows - Data rows from the Excel file
 * @returns {Promise} - Resolves when the data is successfully saved
 */
export const handleSaveExcelContent = async (columns, rows) => {
  try {
    const response = await adminAPI.post('/save-excel', { columns, rows });
    return response.data;
  } catch (error) {
    console.error('Error saving Excel data:', error);
    throw error.response?.data || 'Failed to save Excel data.';
  }
};

export default adminAPI;
