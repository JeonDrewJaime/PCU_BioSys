import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchInstructorSchedule } from '../APIs/adminAPI';
import customFont from '../src/assets/fonts/OldEnglish.ttf';
import pculogo from '../src/assets/pcu_logo_nobg_white.png';


export const downloadPDFDTR = async (user, attendanceData, selectedItems) => {
  try {
    const scheduleData = await fetchInstructorSchedule(`${user.firstname} ${user.lastname}`);
    console.log("📌 Fetched Schedule Data:", scheduleData);

    attendanceData.forEach(({ acadYear, semesters }) => {
      semesters.forEach(({ semester, dates }) => {
        if (!selectedItems[`${acadYear}-${semester}`]) return;

        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.addFont(customFont, "CustomFont", "normal");
        doc.setTextColor("#012763")
        doc.setFont("CustomFont");

        doc.addImage(pculogo, "PNG", 40, 12, 25, 13);
        doc.text("Philippine Christian University", 62, 20, { align: "left" });

        doc.setFontSize(12);
        doc.setFont("times", "bold"); 
        doc.setTextColor("#041129");
        doc.text(`Department:`, 45, 38);
    
        doc.setFont("helvetica", "normal");
        const departmentText = (user?.department || "").toUpperCase();
        const spacedDepartment = departmentText.split("").join(" "); // Add spacing
        doc.text(spacedDepartment, 78, 38);
        doc.line(72, 39, 170, 39); // ✅ Underline for Department
        
        
        doc.setFontSize(10);
        // ✅ Name
        doc.setFont("times", "bold");
        doc.text(`Name:`, 14, 51);
        doc.setFont("helvetica", "normal");
        doc.text(`${user?.firstname} ${user?.lastname}`, 34, 51);
        doc.line(26, 52, 102, 52); // ✅ Underline for Name
        
        // ✅ Role
        doc.setFont("times", "bold");
        doc.text(`Role:`, 105, 51);
        doc.setFont("helvetica", "normal");
        doc.text(`${user?.role}`, 130, 51);
        doc.line(114, 52, 195, 52); // ✅ Underline for Role
        
        // ✅ Academic Year
        doc.setFont("times", "bold");
        doc.text(`Academic Year:`, 14, 58);
        doc.setFont("helvetica", "normal");
        doc.text(`${acadYear}`, 50, 58);
        doc.line(40, 59, 102, 59); // ✅ Underline for Academic Year
        
        // ✅ Semester
        doc.setFont("times", "bold");
        doc.text(`Semester:`, 105, 58);
        doc.setFont("helvetica", "normal");
        doc.text(`${semester}`, 130, 58);
        doc.line(121, 59, 195, 59); // ✅ Underline for Semester
        
        // ✅ Email
        doc.setFont("times", "bold");
        doc.text(`E-mail Address:`, 14, 65);
        doc.setFont("helvetica", "normal");
        doc.text(`${user?.email}`, 50, 65);
        doc.line(40, 66, 195, 66); // ✅ Underline for Email
        

        let yOffset = 80;
        let dtryOffset = 20;

        // ✅ Filter Schedule for the Selected Academic Year & Semester
        const filteredSchedule = scheduleData.filter(
          (schedule) => schedule.academicYear === acadYear && schedule.semester === semester
        );

        if (filteredSchedule.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("SCHEDULE", 14, 90);
          yOffset += 15;

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
            styles: {
              fontSize: 10,
              lineColor: [0, 0, 0], // ✅ Darker Grid (Black)
              lineWidth: 0.1, // ✅ Thicker Grid Lines
            },
            headStyles: {
              fillColor: [1, 39, 99], // ✅ #012763 in RGB
              textColor: [255, 255, 255], // Optional: White text color
              fontStyle: "bold",
            },
            tableLineColor: [0, 0, 0], // ✅ Dark Grid Color
            tableLineWidth: 0.1, // ✅ Thickness of Grid
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
            const slicedCourse = course.slice(10); // Get the actual course name
            const matchedSchedule = filteredSchedule.find(sched =>
              sched.courseTitle.trim().toLowerCase() === slicedCourse.trim().toLowerCase()
            );
          
            let scheduleUnits = matchedSchedule ? matchedSchedule.units : "-";
          
            semesterTableData.push([
              date,
              slicedCourse,
              record.time_in || "-",
              record.time_out || "-",
              record.late_status || "-",
              record.total_hours || "-",
              scheduleUnits,
            ]);
          });
          
        });

        if (semesterTableData.length > 0) {
          doc.addPage(); // ✅ Add a New Page for DTR
        
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("DAILY TIME RECORD", 14, 20); // ✅ Corrected Position
          dtryOffset = 25; // ✅ Increased Y Offset After Adding Page
        
          autoTable(doc, {
            startY: dtryOffset,
            head: [
              ["Date", "Course", "Time In", "Time Out", "Late Status", "Total Hours", "Units"],
            ],
            body: semesterTableData,
            theme: "grid",
            styles: {
              fontSize: 10,
              lineColor: [0, 0, 0], 
              lineWidth: 0.1, 
            },
            headStyles: {
              fillColor: [1, 39, 99],
              textColor: [255, 255, 255], 
              fontStyle: "bold",
            },
            tableLineColor: [0, 0, 0], 
            tableLineWidth: 0.1, 
          });
          
            // ✅ Add Lines Below Table
            let finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.setFont("times", "italic");

   // 🔹 Compute Total Hours Rendered
let totalHoursRendered = semesterTableData.reduce((sum, row) => {
  let hours = parseFloat(row[5]); // Index 5 = "Total Hours"
  return sum + (isNaN(hours) ? 0 : hours);
}, 0);

// 🔹 Render Total Hours
doc.line(60, finalY, 115, finalY); // Line for hours rendered
doc.text(`${totalHoursRendered.toFixed(2)} hrs`, 80, finalY - 1); // Show actual hours rendered
doc.text("Total number of hours rendered", 14, finalY - 1);

            let nextLineY = finalY + 10;
            let recordedDates = semesterTableData.map(row => row[0]);
            recordedDates.sort((a, b) => new Date(a) - new Date(b));
            
            let firstDate = new Date(recordedDates[0]);
            let lastDate = new Date(recordedDates[recordedDates.length - 1]);
            
            const formatDate = (date) =>
              date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
            
            let formattedRange = `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
            
            doc.line(150, nextLineY, 195, nextLineY); 
            doc.text(`${formattedRange}`, 160, nextLineY - 1); // 🗓️ Date Range
            doc.text(
              "I hereby certify that the foregoing is a true record of my actual teaching hours for the period of",
              14,
              nextLineY - 1
            );
            

          doc.line(150, nextLineY, 195, nextLineY); 



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
