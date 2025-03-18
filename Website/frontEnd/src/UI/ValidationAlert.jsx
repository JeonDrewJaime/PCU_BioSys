import React from "react";
import { Box, Alert, Typography } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/Cancel';

const ValidationAlert = ({ rows, users, isValidColumn }) => {
  const yearPattern = /^\d{4}-\d{4}$/;
  const validSemesters = ["1st Sem", "2nd Sem"];
  const numberPattern = /^\d+$/;
  const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
  const specialCharPattern = /^[a-zA-Z0-9\s]+$/;
  const allowedDays = ["M", "T", "W", "TH", "F", "S"];

  const expectedHeaders = ["SECTION", "Curri", "COURSE CODE", "COURSE DESCRIPTION", "TOTAL UNITS", "DAY", "STIME", "ETIME", "ROOM", "INSTRUCTOR"];
  
  const academicYear = rows[0][0];
  const semester = rows[1][0];
  const headerRow = rows[2]; // Third row for validation
  
  const totalUnitsColumn = rows.slice(3).map(row => row[4]?.toString().trim());
  const assignedUsers = rows.slice(3).map(row => row[9]?.trim());
  const stimeColumn = rows.slice(3).map(row => row[6]?.trim());
  const etimeColumn = rows.slice(3).map(row => row[7]?.trim());
  const dayColumn = rows.slice(3).map(row => row[5]?.toUpperCase()?.trim());
  const specialCharColumns = rows.slice(3).map(row => [row[0], row[1], row[2], row[3], row[8]]);

  const isAcademicYearValid = yearPattern.test(academicYear);
  const isSemesterValid = validSemesters.includes(semester);
  const isHeaderRowValid = JSON.stringify(headerRow.map(cell => cell.trim())) === JSON.stringify(expectedHeaders);
  const isTotalUnitsValid = totalUnitsColumn.every(unit => numberPattern.test(unit));
  const isUsersValid = assignedUsers.every(name => users.some(user => `${user.firstname} ${user.lastname}` === name));
  const isDayValid = dayColumn.every(day => allowedDays.includes(day));
  const isSTIMEValid = stimeColumn.every(time => timePattern.test(time));
  const isETIMEValid = etimeColumn.every(time => timePattern.test(time));
  
  const parseTime = timeStr => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return new Date(1970, 0, 1, hours, minutes);
  };

  const isTimeOrderValid = rows.slice(3).every(row => parseTime(row[6]?.trim()) < parseTime(row[7]?.trim()));
  const isSpecialCharValid = specialCharColumns.every(columns => columns.every(value => specialCharPattern.test(value?.toString().trim())));

  return (
<Box sx={{
  display: 'flex',          // Use flexbox to center the content
  flexDirection: 'column',  // Stack the items vertically
  alignItems: 'center',     // Center the content horizontally
  textAlign: 'center',      // Ensure text is centered
  marginBottom: 2,          // Keep the margin for bottom spacing
  height: '31vh',           // Ensure it takes full viewport height for vertical centering
}}>

  <Box severity={isValidColumn() ? "success" : "error"} icon={false} sx={{
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",    // Center the Alert content horizontally
    width: '100%',            // Optional: Adjust width for better layout control
    maxWidth: '2000px', 
    backgroundColor: "#ffffff",
    border: "1px solid #D6D7D6", 
     // Optional: Limit the maximum width
  }}>

    <Typography sx={{ color: '#041129', fontWeight: 600, fontSize: { xs: '14px', sm: '18px', md: '20px' }, mt: 3, mb:1}}>
      It seems there are formatting issues with some of the inputs. Download the Excel template to ensure proper formatting.
    </Typography>

    {isAcademicYearValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> Academic Year and Semester are valid
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid Academic Year or Semester format!
      </Typography>}

    {isHeaderRowValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> The third row (headers) is correctly structured
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> The third row (headers) is incorrect!
      </Typography>}

    {isTotalUnitsValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> Total Units values are valid
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid Total Units!
      </Typography>}

    {isDayValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> Days column is valid
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid Day format!
      </Typography>}

    {isSTIMEValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> All Start Times (STIME) are valid
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid Start Time format!
      </Typography>}

    {isETIMEValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> All End Times (ETIME) are valid
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid End Time format!
      </Typography>}

    {isTimeOrderValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> Start Time is earlier than End Time
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid time order!
      </Typography>}

    {isUsersValid ? 
      <Typography sx={{ color: "green", fontSize: '14px' }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> Assigned user names are valid
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px' }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Invalid assigned user!
      </Typography>}

    {isSpecialCharValid ? 
      <Typography sx={{ color: "green", fontSize: '14px', mb:3 }}>
        <CheckCircleIcon sx={{ color: 'green', fontSize: 14 }} /> No special characters found
      </Typography> 
      : 
      <Typography sx={{ color: "red", fontSize: '14px', mb:3 }}>
        <ErrorOutlineIcon sx={{ color: 'red', fontSize: 14 }} /> Special characters detected!
      </Typography>}
  </Box>
</Box>


  );
};

export default ValidationAlert;
