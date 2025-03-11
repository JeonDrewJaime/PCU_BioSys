import * as XLSX from 'xlsx';

export const downloadExcelSchedule = (selectedRows) => {
  if (selectedRows.length === 0) return;

  selectedRows.forEach((row) => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    worksheetData.push([`${row.acadYear}`]);
    worksheetData.push([`${row.semesterKey}`]);
    worksheetData.push([
      'SECTION', 'CURR', 'COURSE CODE', 'COURSE DESCRIPTION',
      'TOTAL UNITS', 'DAY', 'STIME', 'ETIME', 'ROOM', 'INSTRUCTOR'
    ]);

    row.instructors.forEach((instructor) => {
      instructor.courses.forEach((course) => {
        worksheetData.push([
          course.schedule.section,
          course.curriculum,
          course.courseCode,
          course.courseDescription,
          course.schedule.total_units,
          course.schedule.day,
          course.schedule.start_time,
          course.schedule.end_time,
          course.schedule.room,
          instructor.name,
        ]);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
    XLSX.writeFile(workbook, `${row.acadYear}_${row.semesterKey}.xlsx`);
  });
};

