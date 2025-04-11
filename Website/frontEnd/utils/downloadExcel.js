import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { fetchInstructorSchedule } from '../APIs/adminAPI';



export const downloadExcelDTR = async (user, attendanceData, selectedItems) => {
  try {
    const scheduleData = await fetchInstructorSchedule(`${user.firstname} ${user.lastname}`);
    console.log("📌 Full Schedule Data:", scheduleData); // Display in console

    for (const { acadYear, semesters } of attendanceData) {
      for (const { semester, dates } of semesters) {
        if (!selectedItems[`${acadYear}-${semester}`]) continue;

        const workbook = new ExcelJS.Workbook();

        // ✅ General Information Sheet-----------------------------------------------------
        const generalInfoSheet = workbook.addWorksheet('General Info');
        
        // General Information Data
        const generalInfoData = [
          ["Name of Faculty", "", "", "", `${user.firstname} ${user.lastname}`],
          ["College", "", "", "", user.department],
          ["Dean", "", "", "", "Norman B. Ramos, Ph.D."],
          ["Address", "", "", "", "1648 Taft Avenue corner Pedro Gil St., Malate, Manila"],
          [], // Empty row
          ["School Year", "", "", "", acadYear, "", "", "", "Semester", "", "", semester, "", "", ""],
          [], // Empty row
          ["Schedule of Classes"],
          ["Days", "", "Time", "", "Short Name", "", "", "Course Title", "", "", "", "", "", "", "Units"], 
        ];
        
        generalInfoData.forEach((row, i) => {
          generalInfoSheet.addRow(row);
        });
        
        // Merge Cells General Info
        generalInfoSheet.mergeCells('A1:D1');
        generalInfoSheet.mergeCells('E1:O1');
        generalInfoSheet.mergeCells('A2:D2');
        generalInfoSheet.mergeCells('E2:O2');
        generalInfoSheet.mergeCells('A3:D3');
        generalInfoSheet.mergeCells('E3:O3');
        generalInfoSheet.mergeCells('A4:D4');
        generalInfoSheet.mergeCells('E4:O4');
        generalInfoSheet.mergeCells('A6:D6');
        generalInfoSheet.mergeCells('E6:H6');
        generalInfoSheet.mergeCells('I6:K6');
        generalInfoSheet.mergeCells('L6:O6');
        generalInfoSheet.mergeCells('A8:O8');
                
        // Merge Cells for header Days, Time, Short Name, Course Title, Units
        generalInfoSheet.mergeCells('A9:B10'); // Days
        generalInfoSheet.mergeCells('C9:D10'); // Time
        generalInfoSheet.mergeCells('E9:G10'); // Short Name
        generalInfoSheet.mergeCells('H9:N10'); // Course Title
        generalInfoSheet.mergeCells('O9:O10'); // Units 

        const maxScheduleRows = 13;

        for (let i = 0; i < maxScheduleRows; i++) {
          const schedule = scheduleData[i] || {}; 

         
      let row = generalInfoSheet.addRow([
  schedule.days || "-",          // A - Days
  "",                            // B
  schedule.timeIn || "-",        // C - Time In
  schedule.timeOut || "-",       // D - Time Out
  // Generate shortName based on courseTitle
  (schedule.courseTitle 
    ? schedule.courseTitle.split(' ').map(word => word.charAt(0).toUpperCase()).join('') 
    : "-"),                       // E - Short Name (based on courseTitle)
  "", "",                        // F, G
  schedule.courseTitle || "-",   // H - Course Title
  "", "", "", "", "", "",       // I, J, K, L, M, N
  schedule.units || "-"          // O - Units
]);


          // Apply background color to **all** rows
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFF99" } 
            };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            };
            cell.alignment = { horizontal:  'center', vertical: 'middle' };
          });
        }

        // Merge Cells Proper Formatting
        let startRow = 11;
        let endRow = startRow + maxScheduleRows - 1;

        for (let row = startRow; row <= endRow; row++) {
          generalInfoSheet.mergeCells(`A${row}:B${row}`); // Days 
          generalInfoSheet.mergeCells(`C${row}:C${row}`); // Timein 
          generalInfoSheet.mergeCells(`D${row}:D${row}`); // Timeout 
          generalInfoSheet.mergeCells(`E${row}:G${row}`); // Short Name 
          generalInfoSheet.mergeCells(`H${row}:N${row}`); // Course Title 
          generalInfoSheet.mergeCells(`O${row}:O${row}`); // Units 
        }

          generalInfoSheet.addRow([]);

          let rowPeriodCovered = generalInfoSheet.addRow([
            "Period Covered", "", "", semester, "", "","", 
          ]);

          rowPeriodCovered.eachCell((cell, colNumber) => {
            if (colNumber <= 3) { 
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "99CCFF" } 
              };
            } else {  
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF99" } 
              };
            }
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          });

          // Merge Cells for Period Covered 
          generalInfoSheet.mergeCells("A25:C25");
          generalInfoSheet.mergeCells("D25:H25");

          let rowFirstDay = generalInfoSheet.addRow([
            "First Day of the Period Covered", "", "", "", semester, "", "", "",
          ]);

          rowFirstDay.eachCell((cell, colNumber) => {
            if (colNumber <= 4) { 
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "99CCFF" } 
              };
            } else { 
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF99" } 
              };
            }
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          });

          // Merge Cells 
          generalInfoSheet.mergeCells("A26:D26");
          generalInfoSheet.mergeCells("E26:H26");

        
        // Apply Cell Styles with Background Color for Merged Headers
        const applyStyle = (cell, bgColor, center = false) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
          cell.alignment = { horizontal: center ? 'center' : 'left', vertical: 'middle' };
        };
        
        // Apply Color for Headers
        applyStyle(generalInfoSheet.getCell('A1'), '99CCFF'); // Light Blue
        applyStyle(generalInfoSheet.getCell('E1'), 'FFFF99'); // Light Yellow
        applyStyle(generalInfoSheet.getCell('A2'), '99CCFF'); // Light Blue
        applyStyle(generalInfoSheet.getCell('E2'), 'FFFF99'); // Light Yellow
        applyStyle(generalInfoSheet.getCell('A3'), '99CCFF'); // Light Blue
        applyStyle(generalInfoSheet.getCell('E3'), 'FFFF99'); // Light Yellow
        applyStyle(generalInfoSheet.getCell('A4'), '99CCFF'); // Light Blue
        applyStyle(generalInfoSheet.getCell('E4'), 'FFFF99'); // Light Yellow
        applyStyle(generalInfoSheet.getCell('A6'), '99CCFF'); // Light Blue
        applyStyle(generalInfoSheet.getCell('E6'), 'FFFF99'); // Light Yellow
        applyStyle(generalInfoSheet.getCell('I6'), '99CCFF'); // Light Blue
        applyStyle(generalInfoSheet.getCell('L6'), 'FFFF99'); // Light Yellow
        
        applyStyle(generalInfoSheet.getCell('A8'), 'DECBF6', true); // Schedule of Classes"
        
        // Apply Light Blue Color to Merged Headers (Days, Time, Short Name, Course Title, Units)
        applyStyle(generalInfoSheet.getCell('A9'), '99CCFF', true); // Days
        applyStyle(generalInfoSheet.getCell('A10'), '99CCFF', true); // Days
        applyStyle(generalInfoSheet.getCell('C9'), '99CCFF', true); // Time
        applyStyle(generalInfoSheet.getCell('C10'), '99CCFF', true); // Time
        applyStyle(generalInfoSheet.getCell('E9'), '99CCFF', true); // Short Name
        applyStyle(generalInfoSheet.getCell('E10'), '99CCFF', true); // Short Name
        applyStyle(generalInfoSheet.getCell('H9'), '99CCFF', true); // Course Title
        applyStyle(generalInfoSheet.getCell('H10'), '99CCFF', true); // Course Title
        applyStyle(generalInfoSheet.getCell('O9'), '99CCFF', true); // Units
        applyStyle(generalInfoSheet.getCell('O10'), '99CCFF', true); // Units
        

        // END General Information Sheet-----------------------------------------------------




          // ✅ DTR 1-15 Records Sheet--------------------------------------------------------
          const dtr1to15Sheet = workbook.addWorksheet('Reg(1-15)');

          const dtr1to15Data = [
            ["Philippine Christian University"],  
            [],
            ["DATE TIME RECORD FOR INSTRUCTORS"],  
            [],
            ["College/Department:", "", "", "", user.department],  
            ["","","","","","","","","","","","","","","",],
            [],
            ["Name:", "", `${user.firstname} ${user.lastname}`],  
            ["Address:", "", "1648 Taft Avenue corner Pedro Gil St., Malate, Manila", "", "", "", "","","E-mail:", `${user?.email}`], 
            ["SUBJECT"],
            [],
            ["DATE"],
            [],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],
            ["TOTAL FOR WEEK SUBJECT"],
            [],[],
            ["Total number of hours rendered","","",],
            ["I hereby certify that the foregoing is a true record of my actual teaching hours for the month of","","","","","","","","April 1-15 2025",],
          ];

          // Add data to sheet
          dtr1to15Data.forEach((row) => dtr1to15Sheet.addRow(row));

          // Merge Cells
          dtr1to15Sheet.mergeCells('A1:N1'); // Philippine Christian University
          dtr1to15Sheet.mergeCells('A3:N3'); // DATE TIME RECORD
          dtr1to15Sheet.mergeCells('A5:D5'); // College/Department
          dtr1to15Sheet.mergeCells('A6:N6'); // DATE TIME RECORD
          dtr1to15Sheet.mergeCells('E5:M5'); // College/Department Data
          dtr1to15Sheet.mergeCells('A8:B8'); // Name
          dtr1to15Sheet.mergeCells('C8:M8'); // Faculty Name Data
          dtr1to15Sheet.mergeCells('A9:B9'); // Address Label
          dtr1to15Sheet.mergeCells('C9:H9'); // Address Data
          dtr1to15Sheet.mergeCells('J9:M9'); // Email Data
          dtr1to15Sheet.mergeCells('A10:B11'); //Subject
          dtr1to15Sheet.mergeCells('A12:B13'); //Month 
          dtr1to15Sheet.mergeCells('A29:B29'); //TOTAL FOR WEEK SUBJECT
          dtr1to15Sheet.mergeCells('A32:C32'); //Total number of hours rendered 
          dtr1to15Sheet.mergeCells('A33:H33'); 
          dtr1to15Sheet.mergeCells('I33:K33'); 

          let dayCounter = 0;

          for (const { date } of dates) {
            // Only process first 15 valid days
            if (dayCounter >= 15) break;
          
            // Only process if selected
            if (!selectedItems[`${acadYear}-${semester}-${date}`]) continue;
          
            const day = new Date(date).getDate();
            if (day < 1 || day > 15) continue;
          
            const rowNumber = 13 + day; // Row 14 = Day 1
            const row = dtr1to15Sheet.getRow(rowNumber);
          
            // Show actual date (e.g., "April 3, 2025")
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          
            row.getCell(1).value = formattedDate;
          
            // Merge A and B (columns 1 and 2)
            dtr1to15Sheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
          
            // Optional: style
            row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(1).font = { size: 10 };
            row.getCell(1).border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          
            dayCounter++;
          }
          

          // Center align specific cells
          const centerAlignedCells = ['A1', 'A3', 'E5', 'A10', 'A12', 'A13', 'I33',];

          centerAlignedCells.forEach((cellRef) => {
            dtr1to15Sheet.getCell(cellRef).alignment = { horizontal: 'center', vertical: 'middle' };
          });

          // Right align specific labels
          const rightAlignedCells = ['A5', 'A8', 'A9', 'I9', 'A32', 'A33'];

          rightAlignedCells.forEach((cellRef) => {
            dtr1to15Sheet.getCell(cellRef).alignment = { horizontal: 'right', vertical: 'middle' };

              // Modify font for the right-aligned cells
              dtr1to15Sheet.getCell(cellRef).font = { 
                name: 'Times', 
                size: 11,      
              };
          });

          // Left align specific labels
          const leftAlignedCells = ['C8', 'C9', 'K9'];
          leftAlignedCells.forEach((cellRef) => {
            dtr1to15Sheet.getCell(cellRef).alignment = { horizontal: 'left', vertical: 'middle' };

              // Modify font for the right-aligned cells
              dtr1to15Sheet.getCell(cellRef).font = { 
                name: 'arial', 
                size: 10,      
              };
          });

          // bottom grid
          const bottomGridCells = ['A9','E5', 'A6', 'C8', , 'C8', 'C9', 'K9','I9','N9', 'D32','I33',];
          bottomGridCells.forEach((cellRef) => {
            dtr1to15Sheet.getCell(cellRef).border = {
              bottom: { style: 'thin', color: { argb: '000000' } } // Adds a thin black bottom border
            };
          });

          
          // GRID
          const gridCells = [ 'A10', 'A12', 'A13', 'A29'];
        gridCells.forEach((cellRef) => {
            dtr1to15Sheet.getCell(cellRef).border = {
              bottom: { style: 'thin', color: { argb: '000000' } } ,
              top: { style: 'thin', color: { argb: '000000' } } ,
              left: { style: 'thin', color: { argb: '000000' } } ,
              right: { style: 'thin', color: { argb: '000000' } } ,
            };
          });



          // Increase font size and apply custom font to PCU title
          dtr1to15Sheet.getRow(1).height = 25; // Increase row height for better visibility
          dtr1to15Sheet.getCell('A1').font = { name: 'Old English', size: 20, bold: true }; 
          
          function addLetterSpacing(text, spacing) {
            return text.split('').join(' '.repeat(spacing));
          }
          
          // Add letter spacing for the text in cell A3
          const spacedText = addLetterSpacing('DATE TIME RECORD FOR INSTRUCTORS', 1); // 1 space between each character
          
          dtr1to15Sheet.getCell('A3').value = spacedText;
          dtr1to15Sheet.getCell('A3').font = { name: 'Old English', size: 13, };

          // Set **ALL** columns width to 8
          for (let col = 1; col <= 14; col++) {
            dtr1to15Sheet.getColumn(col).width = 12;
          }

          dtr1to15Sheet.getCell('E5').font = { name: 'Old English', size: 11, };
          dtr1to15Sheet.getCell('C8').font = { name: 'Old English', size: 11, };





          // ✅ Add Table Headers ------------------------



            scheduleData.forEach((schedule, index) => {
            const colStart = 3 + index * 2;
            const rowStart = 10;
            

            const row10 = dtr1to15Sheet.getRow(rowStart);
            const row11 = dtr1to15Sheet.getRow(rowStart + 1);
            const row12 = dtr1to15Sheet.getRow(rowStart + 2);
          
            row10.getCell(colStart).value = schedule.courseTitle || "-";
            row11.getCell(colStart).value = schedule.days || "-";
            row11.getCell(colStart + 1).value = schedule.timeIn && schedule.timeOut
              ? `${schedule.timeIn} - ${schedule.timeOut}`
              : "-";
          
            dtr1to15Sheet.mergeCells(rowStart + 2, colStart, rowStart + 3, colStart);
            dtr1to15Sheet.mergeCells(rowStart + 2, colStart + 1, rowStart + 3, colStart + 1);
            row12.getCell(colStart).value = "FROM";
            row12.getCell(colStart + 1).value = "TO";
          
            // Fill 1–15 days of time in/out
          
            scheduleData.forEach((schedule, index) => {
              const colStart = 3 + index * 2; // FROM in colStart, TO in colStart + 1
            
              // Loop through all 1–15 days
              for (let day = 1; day <= 15; day++) {
                const rowNumber = 13 + day; // Row 14 = Day 1
                const row = dtr1to15Sheet.getRow(rowNumber);
            
                // Find the date object matching this day
                const dateObj = dates.find(({ date }) => new Date(date).getDate() === day);
                let timeIn = "-";
                let timeOut = "-";
            
                if (dateObj && selectedItems[`${acadYear}-${semester}-${dateObj.date}`]) {
                  const { details } = dateObj;
            
                  Object.entries(details).forEach(([course, record]) => {
                    const courseTitle = course.substring(11).trim();
                    if (courseTitle === schedule.courseTitle.trim()) {
                      timeIn = record.time_in || "-";
                      timeOut = record.time_out || "-";
                    }
                  });
                }
            
                // Assign values to the correct columns
                row.getCell(colStart).value = timeIn;
                row.getCell(colStart + 1).value = timeOut;
            
                // Style the cells
                [colStart, colStart + 1].forEach((col) => {
                  row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
                  row.getCell(col).font = { size: 8 };
                  row.getCell(col).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                  };
                  
                });
              }
            });
            
            const totalRowIndex = 29; // "TOTAL FOR WEEK SUBJECT" is on row 29
            const totalWeekCell = dtr1to15Sheet.getCell('D32'); // Total number of hours rendered (D32)
            
            let grandTotalHours = 0;
            
            scheduleData.forEach((schedule, index) => {
              const colStart = 3 + index * 2;       // FROM column
              const toCol = colStart + 1;           // TO column (for total display)
            
              let totalHours = 0;
            
              dates.forEach(({ date, details }) => {
                if (!selectedItems[`${acadYear}-${semester}-${date}`]) return;
            
                Object.entries(details).forEach(([course, record]) => {
                  const courseTitle = course.substring(11); // removes "Course: "
            
                  // If the course matches and has time_in and time_out, calculate the hours
                  if (courseTitle === schedule.courseTitle && record.time_in && record.time_out) {
                    const timeIn = new Date(`${date} ${record.time_in}`);
                    const timeOut = new Date(`${date} ${record.time_out}`);
            
                    // Calculate the difference between time_in and time_out in hours
                    const diffInMillis = timeOut - timeIn; // time in milliseconds
                    const hours = diffInMillis / (1000 * 60 * 60); // convert to hours
            
                    // Only add valid hours (positive values)
                    if (!isNaN(hours) && hours > 0) {
                      totalHours += hours;
                    }
                  }
                });
              });
            
              // Display total in "TO" column on row 29
              const totalCell = dtr1to15Sheet.getCell(totalRowIndex, toCol);
              totalCell.value = totalHours.toFixed(2); // Show up to 2 decimal places
              totalCell.font = { bold: true };
              totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
              totalCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            
              // Add total hours for this course to the grand total
              grandTotalHours += totalHours;
            });
            
            // Now set the grand total hours for the week in D32
            totalWeekCell.value = grandTotalHours.toFixed(2); // Show up to 2 decimal places
            totalWeekCell.font = { bold: true };
            totalWeekCell.alignment = { horizontal: 'center', vertical: 'middle' };
            totalWeekCell.border = {

              bottom: { style: 'thin' },
         
            };
            
            // Merge cells for total rendered area, but only if not merged yet
            if (!dtr1to15Sheet.getCell('D32').isMerged) {
              dtr1to15Sheet.mergeCells('D32:G32'); // Merge total rendered area
            }
            
            

          
 



            
            // Style for Course Title (Row 10)
            row10.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' };
            row10.getCell(colStart).font = { size: 7,  }; 
            row10.getCell(colStart).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }; 
            
            // Style for Day (Row 11)
            row11.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row11.getCell(colStart).font = { size: 10 };
            row11.getCell(colStart).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }; 
            
            // Style for Time (Row 11)
            row11.getCell(colStart + 1).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row11.getCell(colStart + 1).font = { size: 6 }; 
            row11.getCell(colStart + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }; 
            
            // Style for "FROM" (Merged C12:C13)
            row12.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row12.getCell(colStart).font = { size: 10 }; 
            row12.getCell(colStart).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            // Style for "TO" (Merged D12:D13)
            row12.getCell(colStart + 1).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row12.getCell(colStart + 1).font = { size: 10 }; 
            row12.getCell(colStart + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            // Merge course title horizontally across its two columns
            dtr1to15Sheet.mergeCells(rowStart, colStart, rowStart, colStart + 1);
            
            
      
        });
        
// 🔹 Ensure minimum columns until 'N' 
const minColEnd = 14; 
for (let col = 3; col <= minColEnd; col++) {

  const cell10 = dtr1to15Sheet.getCell(10, col);
  const cell11 = dtr1to15Sheet.getCell(11, col);

  if (!cell10.value) {
    cell10.value = "-";
  }
  if (!cell11.value) {
    cell11.value = "-";
  }

  // Apply center alignment
  cell10.alignment = { horizontal: 'center', vertical: 'middle' };
  cell11.alignment = { horizontal: 'center', vertical: 'middle' };

  // Apply border
  cell10.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  cell11.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
}

        
// 🔹 Ensure placeholder "-" in every empty cell from Row 14 to 28 (days 1–15)
for (let rowNum = 12; rowNum <= 29; rowNum++) {
  const row = dtr1to15Sheet.getRow(rowNum);
  for (let col = 3; col <= 14; col++) {
    const cell = row.getCell(col);
    if (!cell.value) {
      cell.value = "-";
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { size: 8 };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  }
}


        // ✅ DTR 16-31 Records Sheet--------------------------------------------------------
            // Create a new worksheet for dates 16-31
                  const dtr16to31Sheet = workbook.addWorksheet('Reg(16-31)');

                  // Data for the new sheet (dates 16 to 31)
                  const dtr16to31Data = [
                    ["Philippine Christian University"],
                    [],
                    ["DATE TIME RECORD FOR INSTRUCTORS"],
                    [],
                    ["College/Department:", "", "", "", user.department],
                    ["","","","","","","","","","","","","","","",],
                    [],
                    ["Name:", "", `${user.firstname} ${user.lastname}`],
                    ["Address:", "", "1648 Taft Avenue corner Pedro Gil St., Malate, Manila", "", "", "", "","","E-mail:", `${user?.email}`], 
                    ["SUBJECT"],
                    [],
                    ["DATE"],
                    [],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],
                    ["TOTAL FOR WEEK SUBJECT"],
                    [],
                    ["Total number of hours rendered","","",],
                    ["I hereby certify that the foregoing is a true record of my actual teaching hours for the month of","","","","","","","","April 16-30 2025",],
                  ];

                  // Add data to the sheet
                  dtr16to31Data.forEach((row) => dtr16to31Sheet.addRow(row));

                  // Merge Cells (same logic as before)
                  dtr16to31Sheet.mergeCells('A1:N1'); // Philippine Christian University
                  dtr16to31Sheet.mergeCells('A3:N3'); // DATE TIME RECORD
                  dtr16to31Sheet.mergeCells('A5:D5'); // College/Department
                  dtr16to31Sheet.mergeCells('A6:N6'); // DATE TIME RECORD
                  dtr16to31Sheet.mergeCells('E5:M5'); // College/Department Data
                  dtr16to31Sheet.mergeCells('A8:B8'); // Name
                  dtr16to31Sheet.mergeCells('C8:M8'); // Faculty Name Data
                  dtr16to31Sheet.mergeCells('A9:B9'); // Address Label
                  dtr16to31Sheet.mergeCells('C9:H9'); // Address Data
                  dtr16to31Sheet.mergeCells('J9:M9'); // Email Data
                  dtr16to31Sheet.mergeCells('A10:B11'); //Subject
                  dtr16to31Sheet.mergeCells('A12:B13'); //Month 
                  dtr16to31Sheet.mergeCells('A30:B30'); //TOTAL FOR WEEK SUBJECT
                  dtr16to31Sheet.mergeCells('A32:C32'); //Total number of hours rendered 
                  dtr16to31Sheet.mergeCells('A33:H33'); 
                  dtr16to31Sheet.mergeCells('I33:K33');

                  // Date Counter Logic for 16-31
                  let dayCounterr = 16; // Starting from 16

                  for (const { date } of dates) {
                    if (dayCounterr > 31) break; // Only process up to the 31st

                    if (!selectedItems[`${acadYear}-${semester}-${date}`]) continue;

                    const day = new Date(date).getDate();
                    if (day < 16 || day > 31) continue;

                    const rowNumber = 13 + (day - 15); // Row 14 = Day 16
                    const row = dtr16to31Sheet.getRow(rowNumber);

                    // Show actual date (e.g., "April 16, 2025")
                    const formattedDate = new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });

                    row.getCell(1).value = formattedDate;

                    // Merge A and B (columns 1 and 2)
                    dtr16to31Sheet.mergeCells(`A${rowNumber}:B${rowNumber}`);

                    // Optional: style
                    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                    row.getCell(1).font = { size: 10 };
                    row.getCell(1).border = {
                      top: { style: 'thin' },
                      left: { style: 'thin' },
                      bottom: { style: 'thin' },
                      right: { style: 'thin' },
                    };

                    dayCounterr++;
                  }

                  // Repeat the styling logic from 1-15 for centering, alignment, borders, and font adjustments.
                  const centerAlignedCellss = ['A1', 'A3', 'E5', 'A10', 'A12', 'A13', 'I33'];
                  centerAlignedCellss.forEach((cellRef) => {
                    dtr16to31Sheet.getCell(cellRef).alignment = { horizontal: 'center', vertical: 'middle' };
                  });

                  const rightAlignedCellss = ['A5', 'A8', 'A9', 'I9', 'A32', 'A33'];
                  rightAlignedCellss.forEach((cellRef) => {
                    dtr16to31Sheet.getCell(cellRef).alignment = { horizontal: 'right', vertical: 'middle' };

                    // Modify font for the right-aligned cells
                    dtr16to31Sheet.getCell(cellRef).font = { 
                      name: 'Times', 
                      size: 11,      
                    };
                  });

                    // Left align specific labels
          const leftAlignedCellss = ['C8', 'C9', 'K9'];
          leftAlignedCellss.forEach((cellRef) => {
            dtr16to31Sheet.getCell(cellRef).alignment = { horizontal: 'left', vertical: 'middle' };

              // Modify font for the right-aligned cells
              dtr16to31Sheet.getCell(cellRef).font = { 
                name: 'arial', 
                size: 10,      
              };
          });

            // bottom grid
            const bottomGridCellss = ['A9','E5', 'A6', 'C8', , 'C8', 'C9', 'K9','I9','N9', 'D32','I33',];
            bottomGridCellss.forEach((cellRef) => {
              dtr16to31Sheet.getCell(cellRef).border = {
                bottom: { style: 'thin', color: { argb: '000000' } } // Adds a thin black bottom border
              };
            });

             
          // GRID
          const gridCellss = [ 'A10', 'A12', 'A13', 'A30'];
          gridCellss.forEach((cellRef) => {
              dtr16to31Sheet.getCell(cellRef).border = {
                bottom: { style: 'thin', color: { argb: '000000' } } ,
                top: { style: 'thin', color: { argb: '000000' } } ,
                left: { style: 'thin', color: { argb: '000000' } } ,
                right: { style: 'thin', color: { argb: '000000' } } ,
              };
            });


            // Increase font size and apply custom font to PCU title
          dtr16to31Sheet.getRow(1).height = 25; // Increase row height for better visibility
          dtr16to31Sheet.getCell('A1').font = { name: 'Old English', size: 20, bold: true }; 
          
          function addLetterSpacingg(text, spacing) {
            return text.split('').join(' '.repeat(spacing));
          }
          
          // Add letter spacing for the text in cell A3
          const spacedTextt = addLetterSpacingg('DATE TIME RECORD FOR INSTRUCTORS', 1); // 1 space between each character
          
          dtr16to31Sheet.getCell('A3').value = spacedTextt;
          dtr16to31Sheet.getCell('A3').font = { name: 'Old English', size: 13, };
  
  
  
                  for (let col = 1; col <= 14; col++) {
                    dtr16to31Sheet.getColumn(col).width = 12;
                  }

                  dtr16to31Sheet.getCell('E5').font = { name: 'Old English', size: 11 };
                  dtr16to31Sheet.getCell('C8').font = { name: 'Old English', size: 11 };




                  // Add Table Headers logic for scheduleData (same as in Reg(1-15))
                  scheduleData.forEach((schedule, index) => {
                    const colStart = 3 + index * 2;
                    const rowStart = 10;

                    const row10 = dtr16to31Sheet.getRow(rowStart);
                    const row11 = dtr16to31Sheet.getRow(rowStart + 1);
                    const row12 = dtr16to31Sheet.getRow(rowStart + 2);

                    row10.getCell(colStart).value = schedule.courseTitle || "-";
                    row11.getCell(colStart).value = schedule.days || "-";
                    row11.getCell(colStart + 1).value = schedule.timeIn && schedule.timeOut
                      ? `${schedule.timeIn} - ${schedule.timeOut}`
                      : "-";

                    dtr16to31Sheet.mergeCells(rowStart + 2, colStart, rowStart + 3, colStart);
                    dtr16to31Sheet.mergeCells(rowStart + 2, colStart + 1, rowStart + 3, colStart + 1);
                    row12.getCell(colStart).value = "FROM";
                    row12.getCell(colStart + 1).value = "TO";


                    
                    // Repeat the time-filling logic for dates 16–31
                    scheduleData.forEach((schedule, index) => {
                      const colStart = 3 + index * 2;

                      // Loop through all 16–31 days
                      for (let day = 16; day <= 31; day++) {
                        const rowNumber = 13 + (day - 15); // Row 14 = Day 16
                        const row = dtr16to31Sheet.getRow(rowNumber);

                        // Find the date object matching this day
                        const dateObj = dates.find(({ date }) => new Date(date).getDate() === day);
                        let timeIn = "-";
                        let timeOut = "-";

                        if (dateObj && selectedItems[`${acadYear}-${semester}-${dateObj.date}`]) {
                          const { details } = dateObj;

                          Object.entries(details).forEach(([course, record]) => {
                            const courseTitle = course.substring(11).trim();
                            if (courseTitle === schedule.courseTitle.trim()) {
                              timeIn = record.time_in || "-";
                              timeOut = record.time_out || "-";
                            }
                          });
                        }

                        // Assign values to the correct columns
                        row.getCell(colStart).value = timeIn;
                        row.getCell(colStart + 1).value = timeOut;

                        // Style the cells
                        [colStart, colStart + 1].forEach((col) => {
                          row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
                          row.getCell(col).font = { size: 8 };
                          row.getCell(col).border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                          };
                        });
                      }
                    });
           

                    const totalRowIndexx = 30;
                    const totalWeekCelll = dtr16to31Sheet.getCell('D32');

                    let grandTotalHourss = 0;

                    // Filter dates from 16–31 only
                    const filteredDates = dates.filter(({ date }) => {
                      const day = new Date(date).getDate();
                      return day >= 16 && day <= 31;
                    });

                    scheduleData.forEach((schedule, index) => {
                      const colStart = 3 + index * 2;
                      const toCol = colStart + 1;

                      let totalHourss = 0;

                      filteredDates.forEach(({ date, details }) => {
                        if (!selectedItems[`${acadYear}-${semester}-${date}`]) return;

                        Object.entries(details).forEach(([course, record]) => {
                          const courseTitle = course.substring(11).trim().toLowerCase();
                          const scheduledCourse = schedule.courseTitle.trim().toLowerCase();

                          if (courseTitle === scheduledCourse && record.time_in && record.time_out) {
                            const timeInn = new Date(`${date} ${record.time_in}`);
                            const timeOutt = new Date(`${date} ${record.time_out}`);
                            const diffInMilliss = timeOutt - timeInn;
                            const hourss = diffInMilliss / (1000 * 60 * 60);

                            if (!isNaN(hourss) && hourss > 0) {
                              totalHourss += hourss;
                            }
                          }
                        });
                      });

                      const totalCell = dtr16to31Sheet.getCell(totalRowIndexx, toCol);
                      totalCell.value = totalHourss.toFixed(2);
                      totalCell.font = { bold: true };
                      totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
                      totalCell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                      };

                      grandTotalHourss += totalHourss;
                    });

                    // Write Grand Total
                    totalWeekCelll.value = grandTotalHourss.toFixed(2);
                    totalWeekCelll.font = { bold: true };
                    totalWeekCelll.alignment = { horizontal: 'center', vertical: 'middle' };
                    totalWeekCelll.border = { bottom: { style: 'thin' } };



           
           // Merge cells for total rendered area, but only if not merged yet
           if (!dtr16to31Sheet.getCell('D32').isMerged) {
             dtr16to31Sheet.mergeCells('D32:G32'); // Merge total rendered area
           }
           
  
            // Style for Course Title (Row 10)
            row10.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' };
            row10.getCell(colStart).font = { size: 7,  }; 
            row10.getCell(colStart).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }; 
            
            // Style for Day (Row 11)
            row11.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row11.getCell(colStart).font = { size: 10 };
            row11.getCell(colStart).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }; 
            
            // Style for Time (Row 11)
            row11.getCell(colStart + 1).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row11.getCell(colStart + 1).font = { size: 6 }; 
            row11.getCell(colStart + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }; 
            
            // Style for "FROM" (Merged C12:C13)
            row12.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row12.getCell(colStart).font = { size: 10 }; 
            row12.getCell(colStart).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            // Style for "TO" (Merged D12:D13)
            row12.getCell(colStart + 1).alignment = { horizontal: 'center', vertical: 'middle' }; 
            row12.getCell(colStart + 1).font = { size: 10 }; 
            row12.getCell(colStart + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            // Merge course title horizontally across its two columns
            dtr16to31Sheet.mergeCells(rowStart, colStart, rowStart, colStart + 1);
            
            
      
        });
    


                  // Ensure placeholders and apply the same grid logic to the new worksheet
// 🔹 Ensure minimum columns until 'N' 
const minColEndd = 14; 
for (let col = 3; col <= minColEndd; col++) {

  const cell10 = dtr16to31Sheet.getCell(10, col);
  const cell11 = dtr16to31Sheet.getCell(11, col);

  if (!cell10.value) {
    cell10.value = "-";
  }
  if (!cell11.value) {
    cell11.value = "-";
  }

  // Apply center alignment
  cell10.alignment = { horizontal: 'center', vertical: 'middle' };
  cell11.alignment = { horizontal: 'center', vertical: 'middle' };

  // Apply border
  cell10.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  cell11.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
}

        
// 🔹 Ensure placeholder "-" in every empty cell from Row 14 to 28 (days 1–15)
for (let rowNum = 12; rowNum <= 30; rowNum++) {
  const row = dtr16to31Sheet.getRow(rowNum);
  for (let col = 3; col <= 14; col++) {
    const cell = row.getCell(col);
    if (!cell.value) {
      cell.value = "-";
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { size: 8 };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  }
}


         // bawal maalis -----------------------------------------------------
                  // ✅ Generate & Download File
                  const fileName = `${user.firstname}_${user.lastname}_Attendance_${acadYear}_${semester}.xlsx`;
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }
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
        