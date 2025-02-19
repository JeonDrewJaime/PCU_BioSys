import { database, ref, set, get } from '../utils/firebase-config';

export const handleSaveExcelContent = (columns, rows) => {
  if (!columns.length || !rows.length) {
    alert('No data to save. Please upload and edit the Excel data.');
    return;
  }
  const academicYear = rows[0]?.[0] || 'Unknown Year';
  const semester = rows[1]?.[0] || 'Unknown Semester';
  const curriculum = rows[3]?.[1] || 'Unknown Curriculum';

  rows.slice(3).forEach((row, rowIndex) => {
    if (!row || row.length === 0) return; // Skip empty rows
    const courseCode = row[2] || `Unknown Course ${rowIndex + 3}`; // Adjust index offset
    const courseDescription = row[3] || `Unknown Description ${rowIndex + 3}`;
    const instructors = row[9] ? row[9].split(',') : ['Unknown Instructor'];
    const courseRef = ref(database, `schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${rowIndex}`);

    set(courseRef, { 
      course_code: courseCode, 
      course_description: courseDescription, 
      curriculum: curriculum 
    })
      .then(() => {
        console.log(`Saved: ${academicYear} > ${semester} > Course ${rowIndex}: ${courseCode}`);
      })
      .catch((error) => {
        console.error('Error saving course data to Firebase:', error);
      });

    instructors.forEach((instructor, instIndex) => {
      const instructorRef = ref(database, `schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${rowIndex}/instructors/${instIndex}`);
      const scheduleRef = ref(database, `schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${rowIndex}/instructors/${instIndex}/schedule`);

      set(instructorRef, { name: instructor })
        .then(() => {
          console.log(`Saved instructor for Course ${rowIndex}: ${instructor}`);
        })
        .catch((error) => {
          console.error('Error saving instructor to Firebase:', error);
        });

      const scheduleData = {
        day: row[5] || 'Unknown Day',
        start_time: row[6] || 'Unknown Start Time',
        end_time: row[7] || 'Unknown End Time',
        room: row[8] || 'Unknown Room',
        section: row[0] || 'Unknown Section',
        total_units: row[4] || 'Unknown Units',
      };

      set(scheduleRef, scheduleData)
        .then(() => {
          console.log(`Saved schedule for Instructor ${instructor}: ${JSON.stringify(scheduleData)}`);
        })
        .catch((error) => {
          console.error('Error saving schedule to Firebase:', error);
        });
    });
  });
};


