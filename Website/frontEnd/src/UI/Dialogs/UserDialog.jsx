import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";

const UserReportDialog = ({ open, onClose, user }) => {
  const [filter, setFilter] = useState("month");
  const [showPresent, setShowPresent] = useState(true);
  const [showLate, setShowLate] = useState(true);
  const [showAbsent, setShowAbsent] = useState(true);

  const filterAttendanceData = () => {
    if (!user?.attendance) return [];

    let dataMap = new Map();
    const today = dayjs();

    Object.entries(user.attendance).forEach(([date, details]) => {
      let present = 0,
        lates = 0,
        absences = 0;

      Object.values(details).forEach((record) => {
        if (record.late_status === "On Time") present++;
        if (record.late_status === "Late") lates++;
        if (record.late_status === "Absent") absences++;
      });

      let key;
      if (filter === "week") {
        const weekNumber = Math.ceil(dayjs(date).date() / 7); // Group by week number in the month
        key = `Week ${weekNumber}`;
      } else if (filter === "month") {
        if (dayjs(date).isAfter(today.subtract(30, "day"))) {
          key = dayjs(date).format("MMM D");
        } else {
          return;
        }
      } else if (filter === "year") {
        key = dayjs(date).format("MMMM");
      } else {
        key = date;
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: key, Present: 0, Late: 0, Absent: 0 });
      }

      let entry = dataMap.get(key);
      entry.Present += present;
      entry.Late += lates;
      entry.Absent += absences;
      dataMap.set(key, entry);
    });

    return Array.from(dataMap.values());
  };

  const calculateImprovement = (data) => {
    return data.map((entry, index, array) => {
      if (index === 0) return { ...entry, Improvement: null }; // No previous data for first entry
  
      const prev = array[index - 1];
      const totalPrev = prev.Present + prev.Late + prev.Absent;
      const improvement = totalPrev > 0 ? ((entry.Present - prev.Present) / totalPrev) * 100 : 0;
  
      return { ...entry, Improvement: improvement.toFixed(2) }; // Store percentage improvement
    });
  };
  
  const attendanceData = calculateImprovement(filterAttendanceData());
  


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" >
      <DialogTitle sx={{bgcolor: "#012763", color: "#ffffff", fontWeight: "bold", fontSize: "24px"}}>
        User Report - {user?.firstname || "N/A"} {user?.lastname || ""}
         <Box sx={{ p: 2, }}>
          <Typography sx={{fontSize: "16px", color: "#ffffff",}}>
            <strong>Email:</strong> {user?.email || "N/A"}
          </Typography>
          <Typography sx={{fontSize: "16px", color: "#ffffff",}}>
            <strong>Role:</strong> {user?.role || "N/A"}
          </Typography>
          <Typography sx={{fontSize: "16px", color: "#ffffff",}}>
            <strong>Department:</strong> {user?.department || "N/A"}
          </Typography>
          </Box>
      </DialogTitle>
      
      <DialogContent sx={{backgroundColor:"#f5f5fb",}}>

         
          <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold", marginBottom: 1, color: "#012763" }}>
            Attendance Overview
          </Typography>


          <Box
  sx={{
    border: "1px solid #D6D7D6", // Thin dark gray border
    padding: 3,
    borderRadius: 4,
    backgroundColor: "#fff",
  }}
>
  <Grid container spacing={2} sx={{ mt: 2 }}>
    {/* Form Group (Left - 4) */}
    <Grid item xs={12} md={4}>
      <FormGroup
        row
        sx={{
          border: "1px solid #D6D7D6",
          borderRadius: 2,
          backgroundColor: "#fff",
          boxShadow: "none",
          minWidth: "300px",
          p: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showPresent}
              onChange={() => setShowPresent(!showPresent)}
            />
          }
          label="Present"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showLate}
              onChange={() => setShowLate(!showLate)}
            />
          }
          label="Late"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showAbsent}
              onChange={() => setShowAbsent(!showAbsent)}
            />
          }
          label="Absent"
        />
      </FormGroup>
    </Grid>

    {/* Form Control (Right - 8) */}
    <Grid item xs={12} md={8}>
      <FormControl fullWidth>
        <InputLabel>Filter By</InputLabel>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="week">Weekly</MenuItem>
          <MenuItem value="month">Monthly</MenuItem>
          <MenuItem value="year">Yearly</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  </Grid>

  {attendanceData.length > 0 ? (
    <Box sx={{ width: "100%", height: 300 }}>
      <LineChart
        dataset={attendanceData}
        xAxis={[{ scaleType: "band", dataKey: "period" }]}
        series={[
          showPresent && {
            dataKey: "Present",
            color: "#9DBE9F",
            showMark: true,
            area: true,
          },
          showLate && {
            dataKey: "Late",
            color: "#FFB35C",
            showMark: true,
            area: true,
          },
          showAbsent && {
            dataKey: "Absent",
            color: "#D37573",
            showMark: true,
            area: true,
          },
        ].filter(Boolean)}
        height={300}
      />
    </Box>
  ) : (
    <Typography sx={{ mt: 2, color: "gray" }}>
      No attendance data available.
    </Typography>
  )}
  </Box>

  <Typography
    variant="h6"
    sx={{ mt: 3, fontWeight: "bold", marginBottom: 1, color: "#012763" }}
  >
    Attendance Records
  </Typography>

  {attendanceData.length > 0 ? (
    <TableContainer
      component={Paper}
      sx={{
        mt: 2,
        border: "1px solid #D6D7D6",
        borderRadius: 4,
        backgroundColor: "#fff",
        boxShadow: "none",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#CEE3F3" }}>
            <TableCell>
              <strong>Period</strong>
            </TableCell>
            {showPresent && (
              <TableCell>
                <strong>Present</strong>
              </TableCell>
            )}
            {showLate && (
              <TableCell>
                <strong>Late</strong>
              </TableCell>
            )}
            {showAbsent && (
              <TableCell>
                <strong>Absent</strong>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {attendanceData.map((entry) => (
            <TableRow key={entry.period}>
              <TableCell>{entry.period}</TableCell>
              {showPresent && <TableCell>{entry.Present}</TableCell>}
              {showLate && <TableCell>{entry.Late}</TableCell>}
              {showAbsent && <TableCell>{entry.Absent}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography sx={{ mt: 2, color: "gray" }}>
      No attendance records available.
    </Typography>
  )}


      </DialogContent>
    </Dialog>
  );
};

export default UserReportDialog;
