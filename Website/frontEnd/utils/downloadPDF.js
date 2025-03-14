import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchInstructorSchedule } from '../APIs/adminAPI';

export const downloadPDFDTR = async (user, attendanceData, selectedItems) => {
  try {
    const scheduleData = await fetchInstructorSchedule(`${user.firstname} ${user.lastname}`);
    console.log("📌 Fetched Schedule Data:", scheduleData);

    attendanceData.forEach(({ acadYear, semesters }) => {
      semesters.forEach(({ semester, dates }) => {
        if (!selectedItems[`${acadYear}-${semester}`]) return;

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("General Information", 105, 10, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Name: ${user?.firstname} ${user?.lastname}`, 14, 20);
        doc.text(`Email: ${user?.email}`, 14, 30);
        doc.text(`Role: ${user?.role}`, 14, 40);
        doc.text(`Department: ${user?.department}`, 14, 50);
        doc.text(`Academic Year: ${acadYear}`, 14, 60);
        doc.text(`Semester: ${semester}`, 14, 70);

        let yOffset = 80;

        // ✅ Filter Schedule for the Selected Academic Year & Semester
        const filteredSchedule = scheduleData.filter(
          (schedule) => schedule.academicYear === acadYear && schedule.semester === semester
        );

        if (filteredSchedule.length > 0) {
          doc.setFontSize(14);
          doc.text("Schedule", 14, yOffset);
          yOffset += 10;

          let scheduleTableData = filteredSchedule.map(schedule => ([
            schedule.courseTitle,
            schedule.days,
            schedule.timeIn,
            schedule.timeOut,
            schedule.units
          ]));

          autoTable(doc, {
            startY: yOffset,
            head: [["Course Title", "Days", "Time In", "Time Out", "Units"]],
            body: scheduleTableData,
            theme: "grid",
            styles: { fontSize: 10 },
          });

          yOffset = doc.lastAutoTable.finalY + 10;
        } else {
          console.warn(`⚠️ No schedule found for AY: ${acadYear}, Sem: ${semester}`);
        }

        // ✅ Attendance Records Table
        let semesterTableData = [];

        dates.forEach(({ date, details }) => {
          if (!selectedItems[`${acadYear}-${semester}-${date}`]) return;

          Object.entries(details).forEach(([course, record]) => {
            // 🔹 **Calculate Validation Progress Percentage**
            let validatedCount = Object.values(details).filter(d => d.status === "Validated").length;
            let validationPercentage = Math.round((validatedCount / 3) * 100) || 0; // Avoid NaN if no records

            semesterTableData.push([
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

        if (semesterTableData.length > 0) {
          autoTable(doc, {
            startY: yOffset,
            head: [
              ["Date", "Course", "Time In", "Time Out", "Late Status", "Validation Progress", "Total Hours", "Units"]
            ],
            body: semesterTableData,
            theme: "grid",
            styles: { fontSize: 10 },
          });
        }

        const fileName = `${user.firstname}_${user.lastname}_Attendance_${acadYear}_${semester}.pdf`;
        doc.save(fileName);
      });
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
  }
};


export const downloadPDFSchedule = (selectedRows) => {
  if (selectedRows.length === 0) return;

  selectedRows.forEach((row) => {
    const doc = new jsPDF('l'); // ✅ Set PDF to Landscape
    const fileName = `${row.acadYear}_${row.semesterKey}.pdf`;
    doc.setFontSize(16);
    doc.text('Class Schedule Report', 148.5, 10, { align: 'center' }); // ✅ Centered horizontally in landscape
    doc.setFontSize(12);
    doc.text(`Academic Year: ${row.acadYear}`, 14, 20);
    doc.text(`Semester: ${row.semesterKey}`, 14, 26);
    let startY = 35;

    row.instructors.forEach((instructor) => {
      doc.setFontSize(11);
      doc.text(`Instructor: ${instructor.name}`, 14, startY);

      const courseData = instructor.courses.map((course) => [
        course.courseCode,
        course.courseDescription,
        course.curriculum,
        course.schedule.total_units,
        course.schedule.section || 'N/A',
        course.schedule.room || 'N/A',
        course.schedule.day || 'N/A',
        course.schedule.start_time || 'N/A',
        course.schedule.end_time || 'N/A',
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Course Code', 'Description', 'Curriculum', 'Units', 'Section', 'Room', 'Day', 'Start Time', 'End Time']],
        body: courseData,
        theme: 'striped',
        styles: { fontSize: 9 },
        columnStyles: { 
          0: { cellWidth: 25 }, // Adjust column width for landscape
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
          8: { cellWidth: 20 },
        },
      });

      startY = doc.lastAutoTable.finalY + 10;
    });

    // ✅ Add Footer
    doc.setFontSize(10);
    doc.text('Generated by Schedule Management System', 148.5, doc.internal.pageSize.height - 10, { align: 'center' });

    doc.save(fileName);
  });
};
