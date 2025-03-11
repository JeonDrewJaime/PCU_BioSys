import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Collapse,
  CircularProgress,
  Box,
  Typography,
  TablePagination,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart";

const UserReportDialog = ({ open, onClose, user }) => {
  const [expandedDates, setExpandedDates] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (!user) return null;

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const calculateTotalHours = (details) => {
    return Object.values(details || {}).reduce(
      (total, record) => total + (parseFloat(record.total_hours) || 0),
      0
    ).toFixed(2);
  };

  const getValidatedCount = (details) => {
    let count = 0;
    for (let i = 1; i <= 3; i++) {
      if (details[`validate_${i}`]?.status === "Validated") count++;
    }
    const percentage = Math.round((count / 3) * 100);

    const getColor = () => {
      if (percentage === 100) return "success";
      if (percentage >= 50) return "warning";
      return "error";
    };

    return (
      <CircularProgress
        variant="determinate"
        value={percentage}
        color={getColor()}
        size={40}
        thickness={4}
      />
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // ✅ Convert user attendance to an array of dates
  const attendanceData = Object.entries(user?.attendance || {}).map(([date, details]) => ({
    date,
    totalHours: calculateTotalHours(details),
    data: details,
  }));

  // ✅ Paginate the DATES themselves
  const paginatedDates = attendanceData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
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
      <DialogContent>
        {/* ✅ Line Chart for Total Hours */}
        <LineChart
          dataset={attendanceData}
          xAxis={[{ scaleType: "band", dataKey: "date" }]}
          series={[
            { dataKey: "totalHours", color: "#1976d2", showMark: true, area: true },
          ]}
        />

        <Typography variant="h6" sx={{ mt: 2, color: "black"}}>
          <strong>Attendance Records</strong>
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableCell>Dates</TableCell>
            </TableHead>
            <TableBody>
              {paginatedDates.map(({ date, data }) => (
                <React.Fragment key={date}>
                  {/* ✅ Date Row */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ backgroundColor: "#f5f5f5" }}>
                      <Tooltip title="Toggle Date">
                        <IconButton onClick={() => toggleDate(date)}>
                          {expandedDates[date] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                      <strong>{date}</strong>
                    </TableCell>
                  </TableRow>

                  {/* ✅ Table Head (only visible when expanded) */}
                  {expandedDates[date] && (
                    <>
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Time In</TableCell>
                          <TableCell>Time Out</TableCell>
                          <TableCell>Late Status</TableCell>
                          <TableCell>Validation Progress</TableCell>
                          <TableCell>Total Hours</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(data).map(([course, details]) => (
                          <TableRow key={course}>
                            <TableCell>{course}</TableCell>
                            <TableCell>{details.time_in}</TableCell>
                            <TableCell>{details.time_out}</TableCell>
                            <TableCell>{details.late_status}</TableCell>
                            <TableCell>{getValidatedCount(details)}</TableCell>
                            <TableCell>{details.total_hours}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          {/* ✅ Pagination for DATES */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={attendanceData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default UserReportDialog;
