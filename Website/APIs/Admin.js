// Admin.js
import { database, ref, push } from '../utils/firebase-config'; // Import Firebase methods

export const handleSaveExcelContent = (columns, rows) => {
  if (!columns.length || !rows.length) {
    alert('No data to save. Please upload and edit the Excel data.');
    return;
  }

  const dbRef = ref(database, 'excel_data');

  rows.forEach((row) => {
    const rowData = {};
    columns.forEach((col, colIndex) => {
      rowData[col] = row[colIndex] || ''; 
    });

    push(dbRef, rowData)
      .then(() => {
        console.log('Row saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving row to Firebase:', error);
      });
  });

  alert('Data saved successfully!');
};
