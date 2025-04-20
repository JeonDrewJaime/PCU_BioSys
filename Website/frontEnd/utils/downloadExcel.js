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

    const monthGroups = {};

    for (const { date } of dates) {
      const d = new Date(date);
      const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;

      if (!monthGroups[key]) {
        monthGroups[key] = [];
      }

      monthGroups[key].push(date);
    }

    Object.entries(monthGroups).forEach(([monthYear, monthDates]) => {
      const sheetName = `${monthYear} 1-15`;
      const worksheet = workbook.addWorksheet(sheetName);


    const dtr1to15Data = [
      ["Philippine Christian University"],  
      [],
      ["DAILY TIME RECORD FOR INSTRUCTORS"],  
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
    
    ];

    // Add data to sheet
    dtr1to15Data.forEach((row) => worksheet.addRow(row));

    // Merge Cells
    worksheet.mergeCells('A1:N1'); // Philippine Christian University
    worksheet.mergeCells('A3:N3'); 
    worksheet.mergeCells('A5:D5'); // College/Department
    worksheet.mergeCells('A6:N6'); 
    worksheet.mergeCells('E5:M5'); // College/Department Data
    worksheet.mergeCells('A8:B8'); // Name
    worksheet.mergeCells('C8:M8'); // Faculty Name Data
    worksheet.mergeCells('A9:B9'); // Address Label
    worksheet.mergeCells('C9:H9'); // Address Data
    worksheet.mergeCells('J9:M9'); // Email Data
    worksheet.mergeCells('A10:B11'); // Subject
    worksheet.mergeCells('A12:B13'); // Month 
    worksheet.mergeCells('A29:B29'); // TOTAL FOR WEEK SUBJECT
    worksheet.mergeCells('A32:C32'); // Total number of hours rendered 
    worksheet.mergeCells('A33:H33'); 
    worksheet.mergeCells('I33:K33');

    let dayCounter = 0;
    const alreadyMergedRows = new Set();

    let displayedMonth = "";
    let displayedYear = "";

    for (const date of monthDates) {
      if (dayCounter >= 15) break;
      if (!selectedItems[`${acadYear}-${semester}-${date}`]) continue;

      const day = new Date(date).getDate();
      if (day < 1 || day > 15) continue;

      if (!displayedMonth && !displayedYear) {
        const firstDateObj = new Date(date);
        displayedMonth = firstDateObj.toLocaleString('default', { month: 'long' });
        displayedYear = firstDateObj.getFullYear();
      }

      const rowNumber = 13 + day;
      const row = worksheet.getRow(rowNumber);

      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      row.getCell(1).value = formattedDate;

      const mergeRange = `A${rowNumber}:B${rowNumber}`;
      if (!alreadyMergedRows.has(rowNumber)) {
        worksheet.mergeCells(mergeRange);
        alreadyMergedRows.add(rowNumber);
      }

      // Style cell...
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

    if (displayedMonth && displayedYear) {
      const certRowIndex = 33;
      const certRow = worksheet.getRow(certRowIndex);

      certRow.getCell(1).value = "I hereby certify that the foregoing is a true record of my actual teaching hours for the month of";
      certRow.getCell(9).value = `${displayedMonth} 1-15 ${displayedYear}`;

      for (let col = 1; col <= 9; col++) {
        const cell = certRow.getCell(col);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { size: 10 };
      }
    }

    // Center align specific cells
    const centerAlignedCells = ['A1', 'A3', 'E5', 'A10', 'A12', 'A13', 'I33'];

    centerAlignedCells.forEach((cellRef) => {
      worksheet.getCell(cellRef).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Right align specific labels
    const rightAlignedCells = ['A5', 'A8', 'A9', 'I9', 'A32', 'A33'];

    rightAlignedCells.forEach((cellRef) => {
      worksheet.getCell(cellRef).alignment = { horizontal: 'right', vertical: 'middle' };

      // Modify font for the right-aligned cells
      worksheet.getCell(cellRef).font = { 
        name: 'Times', 
        size: 11,
      };
    });

    // Left align specific labels
    const leftAlignedCells = ['C8', 'C9', 'K9'];
    leftAlignedCells.forEach((cellRef) => {
      worksheet.getCell(cellRef).alignment = { horizontal: 'left', vertical: 'middle' };

      // Modify font for the left-aligned cells
      worksheet.getCell(cellRef).font = { 
        name: 'arial', 
        size: 10,
      };
    });

    // Bottom grid
    const bottomGridCells = ['A9', 'E5', 'A6', 'C8', 'C9', 'K9', 'I9', 'N9', 'D32', 'I33'];
    bottomGridCells.forEach((cellRef) => {
      worksheet.getCell(cellRef).border = {
        bottom: { style: 'thin', color: { argb: '000000' } }
      };
    });

    // Grid for box borders
    const gridCells = ['A10', 'A12', 'A13', 'A29'];
    gridCells.forEach((cellRef) => {
      worksheet.getCell(cellRef).border = {
        bottom: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });

    // Increase font size and apply custom font to PCU title
    worksheet.getRow(1).height = 30;
    worksheet.getCell('A1').font = { name: 'Old English', size: 20, bold: true };

    // Add letter spacing function
    function addLetterSpacing(text, spacing) {
      return text.split('').join(' '.repeat(spacing));
    }

    // Add letter spacing for A3
    const spacedText = addLetterSpacing('DAILY TIME RECORD FOR INSTRUCTORS', 1);
    worksheet.getCell('A3').value = spacedText;
    worksheet.getCell('A3').font = { name: 'Old English', size: 13 };

    // Set all columns width to 12
    for (let col = 1; col <= 14; col++) {
      worksheet.getColumn(col).width = 12;
    }

    // Custom font for some cells
    worksheet.getCell('E5').font = { name: 'Old English', size: 11 };
    worksheet.getCell('C8').font = { name: 'Old English', size: 11 };


    // ✅ Add Table Headers ------------------------
    scheduleData.forEach((schedule, index) => {
      const colStart = 3 + index * 2;
      const rowStart = 10;

      const row10 = worksheet.getRow(rowStart);
      row10.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' };
      row10.getCell(colStart).font = { size: 7 };
      row10.getCell(colStart).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      const row11 = worksheet.getRow(rowStart + 1);
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

    const row12 = worksheet.getRow(rowStart + 2);
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
    worksheet.mergeCells(rowStart, colStart, rowStart, colStart + 1);

      row10.getCell(colStart).value = schedule.courseTitle || "-";
      row11.getCell(colStart).value = schedule.days || "-";
      row11.getCell(colStart + 1).value = schedule.timeIn && schedule.timeOut
        ? `${schedule.timeIn} - ${schedule.timeOut}`
        : "-";

      worksheet.mergeCells(rowStart + 2, colStart, rowStart + 3, colStart);
      worksheet.mergeCells(rowStart + 2, colStart + 1, rowStart + 3, colStart + 1);
      row12.getCell(colStart).value = "FROM";
      row12.getCell(colStart + 1).value = "TO";

      // Fill 1–15 days of time in/out         
      scheduleData.forEach((schedule, index) => {
        const colStart = 3 + index * 2;
  
    for (let day = 1; day <= 15; day++) {
      const rowNumber = 13 + day;
      const row = worksheet.getRow(rowNumber);
      const cellDate = new Date(row.getCell(1).value); 
  
      let timeIn = "-";
      let timeOut = "-";
  
      
      const dateObj = dates.find(({ date }) => {
        const d = new Date(date);
        return (
          d.getDate() === cellDate.getDate() &&
          d.getMonth() === cellDate.getMonth() &&
          d.getFullYear() === cellDate.getFullYear()
        );
      });
  
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
  
      row.getCell(colStart).value = timeIn;
      row.getCell(colStart + 1).value = timeOut;
  
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
  
  const totalRowIndex = 29;
  const totalWeekCell = worksheet.getCell('D32');

  let grandTotalHours = 0;

  scheduleData.forEach((schedule, index) => {
    const colStart = 3 + index * 2;
    const toCol = colStart + 1;

    let totalHours = 0;

  for (let rowIndex = 14; rowIndex <= 28; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const cellDate = new Date(row.getCell(1).value); 

    const dateObj = dates.find(({ date }) => {
      const d = new Date(date);
      return (
        d.getDate() === cellDate.getDate() &&
        d.getMonth() === cellDate.getMonth() &&
        d.getFullYear() === cellDate.getFullYear()
      );
    });

    if (!dateObj) continue;

    const selected = selectedItems[`${acadYear}-${semester}-${dateObj.date}`];
    if (!selected) continue;

    Object.entries(dateObj.details).forEach(([course, record]) => {
      const courseTitle = course.substring(11).trim();

      if (courseTitle === schedule.courseTitle.trim() && record.time_in && record.time_out) {
        const timeIn = new Date(`${dateObj.date} ${record.time_in}`);
        const timeOut = new Date(`${dateObj.date} ${record.time_out}`);

        const diffInMillis = timeOut - timeIn;
        const hours = diffInMillis / (1000 * 60 * 60);

        if (!isNaN(hours) && hours > 0) {
          totalHours += hours;
        }
      }
    });
  }

  const totalCell = worksheet.getCell(totalRowIndex, toCol);
  totalCell.value = totalHours.toFixed(2);
  totalCell.font = { bold: true };
  totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  grandTotalHours += totalHours;
});

  totalWeekCell.value = grandTotalHours.toFixed(2);
  totalWeekCell.font = { bold: true };
  totalWeekCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalWeekCell.border = {
  bottom: { style: 'thin' },
};

});

    if (!worksheet.getCell('D32').isMerged) {
      worksheet.mergeCells('D32:G32'); 
    }

// Ensure minimum columns until 'N' 
    const minColEnd = 14; 
    for (let col = 3; col <= minColEnd; col++) {

      const cell10 = worksheet.getCell(10, col);
      const cell11 = worksheet.getCell(11, col);

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

    //Ensure placeholder "-" in every empty cell from Row 14 to 28 (days 1–15)
    for (let rowNum = 12; rowNum <= 29; rowNum++) {
      const row = worksheet.getRow(rowNum);
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
    });    



 // ✅ DTR 16-31 Records Sheet--------------------------------------------------------

          Object.entries(monthGroups).forEach(([monthYear, monthDates]) => {
            const sheetName = `${monthYear} 16-31`;
            const worksheet = workbook.addWorksheet(sheetName);

                const dtr16to31Data = [
                    ["Philippine Christian University"],
                    [],
                    ["DAILY TIME RECORD FOR INSTRUCTORS"],
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
               ];

                  dtr16to31Data.forEach((row) => worksheet.addRow(row)
                );

                  worksheet.mergeCells('A1:N1'); // Philippine Christian University
                  worksheet.mergeCells('A3:N3'); 
                  worksheet.mergeCells('A5:D5'); // College/Department
                  worksheet.mergeCells('A6:N6'); 
                  worksheet.mergeCells('E5:M5'); // College/Department Data
                  worksheet.mergeCells('A8:B8'); // Name
                  worksheet.mergeCells('C8:M8'); // Faculty Name Data
                  worksheet.mergeCells('A9:B9'); // Address Label
                  worksheet.mergeCells('C9:H9'); // Address Data
                  worksheet.mergeCells('J9:M9'); // Email Data
                  worksheet.mergeCells('A10:B11'); // Subject
                  worksheet.mergeCells('A12:B13'); // Month 
                  worksheet.mergeCells('A29:B29'); // TOTAL FOR WEEK SUBJECT
                  worksheet.mergeCells('A32:C32'); // Total number of hours rendered 
                  worksheet.mergeCells('A33:H33'); 
                  worksheet.mergeCells('I33:K33');


          let dayCounter = 0;
          const alreadyMergedRows = new Set();

          let displayedMonth = "";
          let displayedYear = "";

          for (const date of monthDates) {
            if (!selectedItems[`${acadYear}-${semester}-${date}`]) continue;

            const day = new Date(date).getDate();
            if (day < 16 || day > 31) continue;

            // Extract the month and year only once
            if (!displayedMonth && !displayedYear) {
              const firstDateObj = new Date(date);
              displayedMonth = firstDateObj.toLocaleString('default', { month: 'long' });
              displayedYear = firstDateObj.getFullYear();
            }

            const rowNumber = 13 + (day - 16 + 1); // adjust row number for 16–31
            const row = worksheet.getRow(rowNumber);

            const formattedDate = new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            row.getCell(1).value = formattedDate;

            const mergeRange = `A${rowNumber}:B${rowNumber}`;
            if (!alreadyMergedRows.has(rowNumber)) {
              worksheet.mergeCells(mergeRange);
              alreadyMergedRows.add(rowNumber);
            }

            // Style cell...
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

        if (displayedMonth && displayedYear) {
          const certRowIndex = 33;
          const certRow = worksheet.getRow(certRowIndex);

          certRow.getCell(1).value = "I hereby certify that the foregoing is a true record of my actual teaching hours for the month of";
          certRow.getCell(9).value = `${displayedMonth} 1-15 ${displayedYear}`;

          // Optional styling
          for (let col = 1; col <= 9; col++) {
            const cell = certRow.getCell(col);
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { size: 10 };
          }
        }

        // Center align specific cells
        const centerAlignedCells = ['A1', 'A3', 'E5', 'A10', 'A12', 'A13', 'I33'];

        centerAlignedCells.forEach((cellRef) => {
          worksheet.getCell(cellRef).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Right align specific labels
        const rightAlignedCells = ['A5', 'A8', 'A9', 'I9', 'A32', 'A33'];

        rightAlignedCells.forEach((cellRef) => {
          worksheet.getCell(cellRef).alignment = { horizontal: 'right', vertical: 'middle' };

          // Modify font for the right-aligned cells
          worksheet.getCell(cellRef).font = { 
            name: 'Times', 
            size: 11,
          };
        });

        // Left align specific labels
        const leftAlignedCells = ['C8', 'C9', 'K9'];
        leftAlignedCells.forEach((cellRef) => {
          worksheet.getCell(cellRef).alignment = { horizontal: 'left', vertical: 'middle' };

          // Modify font for the left-aligned cells
          worksheet.getCell(cellRef).font = { 
            name: 'arial', 
            size: 10,
          };
        });

        // Bottom grid
        const bottomGridCells = ['A9', 'E5', 'A6', 'C8', 'C9', 'K9', 'I9', 'N9', 'D32', 'I33'];
        bottomGridCells.forEach((cellRef) => {
          worksheet.getCell(cellRef).border = {
            bottom: { style: 'thin', color: { argb: '000000' } }
          };
        });

        // Grid for box borders
        const gridCells = ['A10', 'A12', 'A13', 'A29'];
        gridCells.forEach((cellRef) => {
          worksheet.getCell(cellRef).border = {
            bottom: { style: 'thin', color: { argb: '000000' } },
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
          };
        });

        // Increase font size and apply custom font to PCU title
        worksheet.getRow(1).height = 30;
        worksheet.getCell('A1').font = { name: 'Old English', size: 20, bold: true };

        // Add letter spacing function
        function addLetterSpacing(text, spacing) {
          return text.split('').join(' '.repeat(spacing));
        }

        // Add letter spacing for A3
        const spacedText = addLetterSpacing('DAILY TIME RECORD FOR INSTRUCTORS', 1);
        worksheet.getCell('A3').value = spacedText;
        worksheet.getCell('A3').font = { name: 'Old English', size: 13 };

        // Set all columns width to 12
        for (let col = 1; col <= 14; col++) {
          worksheet.getColumn(col).width = 12;
        }

        // Custom font for some cells
        worksheet.getCell('E5').font = { name: 'Old English', size: 11 };
        worksheet.getCell('C8').font = { name: 'Old English', size: 11 };

        // Table Headers ------------------------
        scheduleData.forEach((schedule, index) => {
          const colStart = 3 + index * 2;
          const rowStart = 10;

          const row10 = worksheet.getRow(rowStart);
          row10.getCell(colStart).alignment = { horizontal: 'center', vertical: 'middle' };
          row10.getCell(colStart).font = { size: 7 };
          row10.getCell(colStart).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          const row11 = worksheet.getRow(rowStart + 1);
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


          const row12 = worksheet.getRow(rowStart + 2);
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

        worksheet.mergeCells(rowStart, colStart, rowStart, colStart + 1);

          row10.getCell(colStart).value = schedule.courseTitle || "-";
          row11.getCell(colStart).value = schedule.days || "-";
          row11.getCell(colStart + 1).value = schedule.timeIn && schedule.timeOut
            ? `${schedule.timeIn} - ${schedule.timeOut}`
            : "-";

          worksheet.mergeCells(rowStart + 2, colStart, rowStart + 3, colStart);
          worksheet.mergeCells(rowStart + 2, colStart + 1, rowStart + 3, colStart + 1);
          row12.getCell(colStart).value = "FROM";
          row12.getCell(colStart + 1).value = "TO";

          // Fill 1–15 days of time in/out         
          scheduleData.forEach((schedule, index) => {
            const colStart = 3 + index * 2;
          
            for (let day = 1; day <= 15; day++) {
              const rowNumber = 13 + day;
              const row = worksheet.getRow(rowNumber);
              const cellDate = new Date(row.getCell(1).value); 
          
              let timeIn = "-";
              let timeOut = "-";
          

              const dateObj = dates.find(({ date }) => {
                const d = new Date(date);
                return (
                  d.getDate() === cellDate.getDate() &&
                  d.getMonth() === cellDate.getMonth() &&
                  d.getFullYear() === cellDate.getFullYear()
                );
              });
          
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
          
              row.getCell(colStart).value = timeIn;
              row.getCell(colStart + 1).value = timeOut;
          
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
          

          const totalRowIndex = 30;
        const totalWeekCell = worksheet.getCell('D32');

        let grandTotalHours = 0;

        scheduleData.forEach((schedule, index) => {
          const colStart = 3 + index * 2;
          const toCol = colStart + 1;

          let totalHours = 0;

          for (let rowIndex = 14; rowIndex <= 28; rowIndex++) {
            const row = worksheet.getRow(rowIndex);
            const cellDate = new Date(row.getCell(1).value); 

            const dateObj = dates.find(({ date }) => {
              const d = new Date(date);
              return (
                d.getDate() === cellDate.getDate() &&
                d.getMonth() === cellDate.getMonth() &&
                d.getFullYear() === cellDate.getFullYear()
              );
            });

            if (!dateObj) continue;

            const selected = selectedItems[`${acadYear}-${semester}-${dateObj.date}`];
            if (!selected) continue;

            Object.entries(dateObj.details).forEach(([course, record]) => {
              const courseTitle = course.substring(11).trim();

              if (courseTitle === schedule.courseTitle.trim() && record.time_in && record.time_out) {
                const timeIn = new Date(`${dateObj.date} ${record.time_in}`);
                const timeOut = new Date(`${dateObj.date} ${record.time_out}`);

                const diffInMillis = timeOut - timeIn;
                const hours = diffInMillis / (1000 * 60 * 60);

                if (!isNaN(hours) && hours > 0) {
                  totalHours += hours;
                }
              }
            });
          }

          const totalCell = worksheet.getCell(totalRowIndex, toCol);
          totalCell.value = totalHours.toFixed(2);
          totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
          totalCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          grandTotalHours += totalHours;
        });

        totalWeekCell.value = grandTotalHours.toFixed(2);
        totalWeekCell.font = { bold: true };
        totalWeekCell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalWeekCell.border = {
          bottom: { style: 'thin' },
        };

        });

        if (!worksheet.getCell('D32').isMerged) {
          worksheet.mergeCells('D32:G32'); 
        }


        // minimum columns until 'N' 
        const minColEnd = 14; 
        for (let col = 3; col <= minColEnd; col++) {

          const cell10 = worksheet.getCell(10, col);
          const cell11 = worksheet.getCell(11, col);

          if (!cell10.value) {
            cell10.value = "-";
          }
          if (!cell11.value) {
            cell11.value = "-";
          }

          // center alignment
          cell10.alignment = { horizontal: 'center', vertical: 'middle' };
          cell11.alignment = { horizontal: 'center', vertical: 'middle' };

          // border
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
          const row = worksheet.getRow(rowNum);
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

        });





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

        // Set column widths
        worksheet['!cols'] = [
          { wch: 10 },  // SECTION
          { wch: 10 },  // CURR
          { wch: 15 },  // COURSE CODE
          { wch: 35 },  // COURSE DESCRIPTION
          { wch: 11 },  // TOTAL UNITS
          { wch: 5 },  // DAY
          { wch: 8 },  // STIME
          { wch: 8 },  // ETIME
          { wch: 5 },  // ROOM
          { wch: 20 },  // INSTRUCTOR
        ];

     
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
    XLSX.writeFile(workbook, `${row.acadYear}_${row.semesterKey}.xlsx`);
  });
};
        