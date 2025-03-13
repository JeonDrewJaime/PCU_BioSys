import * as XLSX from 'xlsx';
import { fetchInstructorSchedule } from '../APIs/adminAPI';


export const downloadExcel = async (user) => {
  if (!user) return;

  try {
    // 🔹 Fetch schedule data from API
    const scheduleData = await fetchInstructorSchedule(`${user.firstname} ${user.lastname}`);
    console.log("📌 Fetched Schedule Data:", scheduleData);

    const wb = XLSX.utils.book_new();

    // ✅ User Info & Schedule Sheet
    const userScheduleSheet = [
      ["User Attendance Report"],
      ["Name", `${user?.firstname} ${user?.lastname}`],
      ["Email", user?.email],
      ["Role", user?.role],
      ["Department", user?.department],
      [], // Empty row for spacing
      ["Schedule"], // Header for Schedule section
      ["Academic Year", "Semester", "Course Title", "Days", "Time In", "Time Out", "Units"]
    ];

    if (scheduleData && scheduleData.length > 0) {
      scheduleData.forEach((schedule) => {
        userScheduleSheet.push([
          schedule.academicYear,
          schedule.semester,
          schedule.courseTitle,
          schedule.days,
          schedule.timeIn,
          schedule.timeOut,
          schedule.units
        ]);
      });
    } else {
      console.warn("⚠️ No schedule data found for instructor:", `${user.firstname} ${user.lastname}`);
    }

    const wsUserSchedule = XLSX.utils.aoa_to_sheet(userScheduleSheet);
    XLSX.utils.book_append_sheet(wb, wsUserSchedule, "User Info & Schedule");

    // ✅ Attendance Records Sheet
    const attendanceData = [
      ["Date", "Course", "Time In", "Time Out", "Late Status", "Validation Progress", "Total Hours", "Units"],
    ];

    Object.entries(user?.attendance || {}).forEach(([date, details]) => {
      Object.entries(details).forEach(([course, record]) => {
        let validatedCount = 0;
        for (let i = 1; i <= 3; i++) {
          if (record[`validate_${i}`]?.status === "Validated") validatedCount++;
        }
        const validationProgress = `${Math.round((validatedCount / 3) * 100)}%`;

        attendanceData.push([
          date,
          course,
          record.time_in,
          record.time_out,
          record.late_status,
          validationProgress,
          record.total_hours,
          record.units,
        ]);
      });
    });

    const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance Records");

    // ✅ Save the Excel file
    const fileName = `${user.firstname}_${user.lastname}_Attendance.xlsx`;
    console.log(`💾 Saving file: ${fileName}`);
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("❌ Error downloading Excel:", error);
  }
};


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

