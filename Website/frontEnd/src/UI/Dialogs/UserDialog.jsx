import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Button,
  Paper,
  Tooltip,
  IconButton,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
  Checkbox,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const UserReportDialog = ({ open, onClose, user }) => {
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  if (!user) return null;

  const toggleExpand = (stateSetter, key) => {
    stateSetter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelect = (key, parentKey = null, grandparentKey = null) => {
    setSelectedItems((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
  
      // If a date is selected, ensure the semester and academic year are selected
      if (parentKey) newState[parentKey] = true;
      if (grandparentKey) newState[grandparentKey] = true;
  
      return newState;
    });
  };
  
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    let newSelection = {};
    attendanceData.forEach(({ acadYear, semesters }) => {
      newSelection[acadYear] = !selectAll;
      semesters.forEach(({ semester, dates }) => {
        newSelection[`${acadYear}-${semester}`] = !selectAll;
        dates.forEach(({ date }) => {
          newSelection[`${acadYear}-${semester}-${date}`] = !selectAll;
        });
      });
    });
    setSelectedItems(newSelection);
  };

  const attendanceData = Object.entries(user?.attendance || {}).map(([acadYear, semesters]) => ({
    acadYear,
    semesters: Object.entries(semesters).map(([semester, dates]) => ({
      semester,
      dates: Object.entries(dates).map(([date, details]) => ({ date, details })),
    })),
  }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("User Attendance Report", 105, 10, { align: "center" });
  
    doc.setFontSize(12);
    doc.text(`Name: ${user?.firstname} ${user?.lastname}`, 14, 20);
    doc.text(`Email: ${user?.email}`, 14, 30);
    doc.text(`Role: ${user?.role}`, 14, 40);
    doc.text(`Department: ${user?.department}`, 14, 50);
  
    let yOffset = 60;
  
    attendanceData.forEach(({ acadYear, semesters }) => {
      if (!selectedItems[acadYear]) return;
  
      doc.setFontSize(14);
      doc.text(`Academic Year: ${acadYear}`, 14, yOffset);
      yOffset += 7;
  
      semesters.forEach(({ semester, dates }) => {
        // Automatically select all dates if the semester is selected
        if (!selectedItems[`${acadYear}-${semester}`]) return;
  
        doc.setFontSize(12);
        doc.text(`  Semester: ${semester}`, 14, yOffset);
        yOffset += 6;
  
        let semesterTableData = [];
  
        dates.forEach(({ date, details }) => {
          // Automatically include all attendance records if a semester is selected
          if (!selectedItems[`${acadYear}-${semester}`] && !selectedItems[`${acadYear}-${semester}-${date}`]) return;
  
          Object.entries(details).forEach(([course, record]) => {
            semesterTableData.push([
              date,
              course,
              record.time_in || "-",
              record.time_out || "-",
              record.late_status || "-",
              `${record.status === "Validated" ? "✅" : "❌"}`, // Indicate validation
              record.total_hours || "-",
              record.units || "-",
            ]);
          });
        });
  
        if (semesterTableData.length > 0) {
          autoTable(doc, {
            startY: yOffset,
            head: [["Date", "Course", "Time In", "Time Out", "Late Status", "Validation", "Total Hours", "Units"]],
            body: semesterTableData,
            theme: "grid",
            styles: { fontSize: 10 },
          });
  
          yOffset = doc.lastAutoTable.finalY + 10;
        }
      });
    });
  
    doc.save(`${user.firstname}_${user.lastname}_Attendance.pdf`);
  };
  

  const getValidatedCount = (details) => {
    let count = Object.values(details).filter(d => d.status === "Validated").length;
    let percentage = Math.round((count / 3) * 100);
    return (
      <CircularProgress
        variant="determinate"
        value={percentage}
        color={percentage === 100 ? "success" : percentage >= 50 ? "warning" : "error"}
        size={40}
        thickness={4}
      />
    );
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ bgcolor: "#012763", color: "#ffffff", fontWeight: "bold", fontSize: "24px" }}>
        User Report - {user?.firstname || "N/A"} {user?.lastname || ""}
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: "16px", color: "#ffffff" }}>
            <strong>Email:</strong> {user?.email || "N/A"}
          </Typography>
          <Typography sx={{ fontSize: "16px", color: "#ffffff" }}>
            <strong>Role:</strong> {user?.role || "N/A"}
          </Typography>
          <Typography sx={{ fontSize: "16px", color: "#ffffff" }}>
            <strong>Department:</strong> {user?.department || "N/A"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Button variant="contained" color="primary" onClick={downloadPDF} sx={{ mb: 2 }}>
          Download Selected as PDF
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleSelectAll} sx={{ mb: 2, ml: 2 }}>
          {selectAll ? "Deselect All" : "Select All"}
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                
                <TableCell>Select</TableCell>
                <TableCell>Academic Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {attendanceData.map(({ acadYear, semesters }) => (
                <React.Fragment key={acadYear}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      
                      <Checkbox checked={selectedItems[acadYear] || false} onChange={() => toggleSelect(acadYear)} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => toggleExpand(setExpandedYears, acadYear)}>
                        {expandedYears[acadYear] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <strong>{acadYear}</strong>
                    </TableCell>
                  </TableRow>

                  {expandedYears[acadYear] &&
                    semesters.map(({ semester, dates }) => (
                      <React.Fragment key={`${acadYear}-${semester}`}>
                        <TableRow> 
                          <TableCell >
                          <Checkbox
  checked={selectedItems[`${acadYear}-${semester}`] || false}
  onChange={() => toggleSelect(`${acadYear}-${semester}`, acadYear)}
/>
</TableCell>
<TableCell>
<IconButton onClick={() => toggleExpand(setExpandedSemesters, `${acadYear}-${semester}`)}>
                              {expandedSemesters[`${acadYear}-${semester}`] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                            <strong>{semester}</strong>
                            </TableCell>
<TableCell/>
                        
                         
                          
                        </TableRow>

                        {expandedSemesters[`${acadYear}-${semester}`] &&
                          dates.map(({ date, details }) => (
                            <React.Fragment key={`${acadYear}-${semester}-${date}`}>
                              <TableRow>
                                <TableCell/>
                                <TableCell sx={{ pl: 8 }}><IconButton onClick={() => toggleExpand(setExpandedDates, date)}>
                                    {expandedDates[date] ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>{date}  </TableCell>
                               
                              </TableRow>

                              {expandedDates[date] && (
                                <TableRow>
                                  <TableCell colSpan={2}>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Course</TableCell>
                                          <TableCell>Time In</TableCell>
                                          <TableCell>Time Out</TableCell>
                                          <TableCell>Late Status</TableCell>
                                          <TableCell>Validation Progress</TableCell>
                                          <TableCell>Total Hours</TableCell>
                                          <TableCell>Units</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {Object.entries(details).map(([course, record]) => (
                                          <TableRow key={course}>
                                            <TableCell>{course}</TableCell>
                                            <TableCell>{record.time_in}</TableCell>
                                            <TableCell>{record.time_out}</TableCell>
                                            <TableCell>{record.late_status}</TableCell>
                                            <TableCell>{getValidatedCount(record)}</TableCell>
                                            <TableCell>{record.total_hours}</TableCell>
                                            <TableCell>{record.units}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                      </React.Fragment>
                    ))}j
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default UserReportDialog;
