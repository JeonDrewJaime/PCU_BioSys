import React from "react";
import { Box, Alert, Typography } from "@mui/material";

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
    <Box sx={{ marginBottom: 2 }}>
      <Alert severity={isValidColumn() ? "success" : "error"} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {isAcademicYearValid ? <Typography sx={{ color: "green" }}>✔️ Academic Year and Semester are valid</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid Academic Year or Semester format!</Typography>}
        {isHeaderRowValid ? <Typography sx={{ color: "green" }}>✔️ The third row (headers) is correctly structured</Typography> : <Typography sx={{ color: "red" }}>❌ The third row (headers) is incorrect!</Typography>}
        {isTotalUnitsValid ? <Typography sx={{ color: "green" }}>✔️ Total Units values are valid</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid Total Units!</Typography>}
        {isDayValid ? <Typography sx={{ color: "green" }}>✔️ Days column is valid</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid Day format!</Typography>}
        {isSTIMEValid ? <Typography sx={{ color: "green" }}>✔️ All Start Times (STIME) are valid</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid Start Time format!</Typography>}
        {isETIMEValid ? <Typography sx={{ color: "green" }}>✔️ All End Times (ETIME) are valid</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid End Time format!</Typography>}
        {isTimeOrderValid ? <Typography sx={{ color: "green" }}>✔️ Start Time is earlier than End Time</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid time order!</Typography>}
        {isUsersValid ? <Typography sx={{ color: "green" }}>✔️ Assigned user names are valid</Typography> : <Typography sx={{ color: "red" }}>❌ Invalid assigned user!</Typography>}
        {isSpecialCharValid ? <Typography sx={{ color: "green" }}>✔️ No special characters found</Typography> : <Typography sx={{ color: "red" }}>❌ Special characters detected!</Typography>}
      </Alert>
    </Box>
  );
};

export default ValidationAlert;
