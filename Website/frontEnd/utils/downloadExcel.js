import * as XLSX from 'xlsx';
import { fetchInstructorSchedule } from '../APIs/adminAPI';


export const downloadExcelDTR = async (user, attendanceData, selectedItems) => {
  try {
    const scheduleData = await fetchInstructorSchedule(`${user.firstname} ${user.lastname}`);
    console.log("📌 Full Schedule Data:", scheduleData); // Display in console

    attendanceData.forEach(({ acadYear, semesters }) => {
      semesters.forEach(({ semester, dates }) => {
        if (!selectedItems[`${acadYear}-${semester}`]) return;

        const workbook = XLSX.utils.book_new();

        // ✅ General Information Sheet
        let generalInfoData = [
          ["Name of Faculty", `${user.firstname} ${user.lastname}`],
          ["College", user.department],
          ["Dean", "NORMAN B. RAMOS, Ph.D."], // Hardcoded as per the image
          ["Address", ""],
          [],
          ["School Year", acadYear, "", "", "Semester", semester],
          [],
          ["Schedule of Classes"],
          ["Days", "Time", "Short Name", "Course Title", "Units"],
        ];

        const filteredSchedule = scheduleData.filter(
          (schedule) => schedule.academicYear === acadYear && schedule.semester === semester
        );

        filteredSchedule.forEach(schedule => {
          generalInfoData.push([
            schedule.days,
            `${schedule.timeIn} - ${schedule.timeOut}`,
            schedule.shortName,
            schedule.courseTitle,
            schedule.units
          ]);
        });

        const generalInfoSheet = XLSX.utils.aoa_to_sheet(generalInfoData);
        XLSX.utils.book_append_sheet(workbook, generalInfoSheet, "General Info");

        // ✅ Attendance Records Sheet
        let attendanceDataSheet = [
          ["Date", "Course", "Time In", "Time Out", "Late Status", "Validation Progress", "Total Hours", "Units"],
        ];

        dates.forEach(({ date, details }) => {
          if (!selectedItems[`${acadYear}-${semester}-${date}`]) return;

          Object.entries(details).forEach(([course, record]) => {
            let validatedCount = Object.values(details).filter(d => d.status === "Validated").length;
            let validationPercentage = Math.round((validatedCount / 3) * 100) || 0;

            attendanceDataSheet.push([
              date,
              course,
              record.time_in || "-",
              record.time_out || "-",
              record.late_status || "-",
              `${validationPercentage}%`,  // ✅ Include Validation Progress
              record.total_hours || "-",
              record.units || "-",
            ]);
          });
        });

        const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceDataSheet);
        XLSX.utils.book_append_sheet(workbook, attendanceSheet, "Attendance Records");

        // ✅ Full Schedule Data Sheet (New Addition)
        let scheduleSheetData = [
          ["Academic Year", "Semester", "Days", "Time In", "Time Out", "Short Name", "Course Title", "Units"]
        ];

        scheduleData.forEach(schedule => {
          scheduleSheetData.push([
            schedule.academicYear,
            schedule.semester,
            schedule.days,
            schedule.timeIn,
            schedule.timeOut,
            schedule.shortName,
            schedule.courseTitle,
            schedule.units
          ]);
        });

        const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleSheetData);
        XLSX.utils.book_append_sheet(workbook, scheduleSheet, "Full Schedule");

        // ✅ Generate File
        const fileName = `${user.firstname}_${user.lastname}_Attendance_${acadYear}_${semester}.xlsx`;
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        // ✅ Create a download link dynamically
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  } catch (error) {
    console.error("❌ Error generating Excel:", error);
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

