import React, { useState,useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadPDFDTR } from "../../../utils/downloadPDF";
import { downloadExcelDTR } from "../../../utils/downloadExcel";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


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
  FormControl,
  InputLabel, 
  Select,
  MenuItem ,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const UserReportDialog = ({ open, onClose, user }) => {
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [chartFilter, setChartFilter] = useState("All");
  const [filterType, setFilterType] = useState("Daily");


const [selectedSemester, setSelectedSemester] = useState("");
  useEffect(() => {
    if (!user?.attendance || !open) return;
  
    const years = {};
    const semesters = {};
    const dates = {};
  
    Object.entries(user.attendance).forEach(([acadYear, semestersData]) => {
      years[acadYear] = false;
  
      Object.entries(semestersData).forEach(([semester, dateData]) => {
        const semKey = `${acadYear}-${semester}`;
        semesters[semKey] = false;
  
        Object.keys(dateData).forEach((date) => {
          dates[date] = false;
        });
      });
    });
  
    setExpandedYears(years);
    setExpandedSemesters(semesters);
    setExpandedDates(dates);
  }, [user, open]);
  
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
  
  const generateChartData = () => {
    const statusMap = {};
  
    attendanceData.forEach(({ acadYear, semesters }) => {
      semesters.forEach(({ semester, dates }) => {
        dates.forEach(({ date, details }) => {
          const dateObj = new Date(date);
          
          // Apply filter logic
          let filterKey = date;
          if (filterType === "Weekly") {
            // Calculate week of the year
            const week = Math.floor(dateObj.getDate() / 7);
            filterKey = `${dateObj.getFullYear()}-W${week}`;
          } else if (filterType === "Yearly") {
            filterKey = `${dateObj.getFullYear()}`;
          }
  
          if (!statusMap[filterKey]) {
            statusMap[filterKey] = { date: filterKey, Late: 0, Absent: 0, Attended: 0 };
          }
  
          Object.values(details).forEach((record) => {
            const status = record?.late_status || record?.status;
            if (status === "Late") statusMap[filterKey].Late++;
            else if (status === "Absent") statusMap[filterKey].Absent++;
            else if (status === "Attended" || status === "Present") statusMap[filterKey].Attended++;
          });
        });
      });
    });
  
    let data = Object.values(statusMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  
    if (chartFilter !== "All") {
      data = data.map((entry) => ({
        date: entry.date,
        [chartFilter]: entry[chartFilter],
      }));
    }
  
    return data;
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

  const attendanceData = Object.entries(user?.attendance || {}).reduce((acc, [acadYear, semesters]) => {
    if (selectedYear && selectedYear !== acadYear) return acc;
  
    const filteredSemesters = Object.entries(semesters)
      .filter(([semester]) => !selectedSemester || selectedSemester === semester)
      .map(([semester, dates]) => ({
        semester,
        dates: Object.entries(dates).map(([date, details]) => ({ date, details })),
      }));
  
    if (filteredSemesters.length > 0) {
      acc.push({ acadYear, semesters: filteredSemesters });
    }
  
    return acc;
  }, []);
  

 
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" >
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

      <DialogContent sx={{bgcolor:"#f5f5fb"}}>



     <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mt: 1, mb: 1, p:2, }}>
  {/* Left side content (Select All, Filters, etc.) */}
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
    {/* Select All Section */}

    {/* Filters */}
    <FormControl sx={{ minWidth: 150, mr: 1 }} size="small">
  <InputLabel>Academic Year</InputLabel>
  <Select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
  >
    <MenuItem value="">All</MenuItem>
    {Object.keys(user?.attendance || {}).map((year) => (
      <MenuItem key={year} value={year}>{year}</MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={{ minWidth: 150, mr: 1 }} size="small">
  <InputLabel>Semester</InputLabel>
  <Select
    value={selectedSemester}
    onChange={(e) => setSelectedSemester(e.target.value)}
  >
    <MenuItem value="">All</MenuItem>
    {/* You can dynamically extract semesters too */}
    {Array.from(
      new Set(
        Object.values(user?.attendance || {})
          .flatMap(semesters => Object.keys(semesters))
      )
    ).map((sem) => (
      <MenuItem key={sem} value={sem}>{sem}</MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={{ minWidth: 150, mr: 1 }} size="small">
  <InputLabel>Status Filter</InputLabel>
  <Select value={chartFilter} onChange={(e) => setChartFilter(e.target.value)}>
    <MenuItem value="All">All</MenuItem>
    <MenuItem value="Late">Late</MenuItem>
    <MenuItem value="Absent">Absent</MenuItem>
    <MenuItem value="Attended">Attended</MenuItem>
  </Select>
</FormControl>

<FormControl sx={{ minWidth: 150, mr: 1 }} size="small">
  <InputLabel>Filter Type</InputLabel>
  <Select
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
  >
    <MenuItem value="Daily">Daily</MenuItem>
    <MenuItem value="Weekly">Weekly</MenuItem>
    <MenuItem value="Yearly">Yearly</MenuItem>
  </Select>
</FormControl>

  </Box>

  {/* Right side buttons */}
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {/* Download as PDF Button */}
    <Button 
    variant="contained" 
    color="primary"  
    onClick={() => downloadPDFDTR(user, attendanceData, selectedItems)} 
    sx={{ 
      borderRadius: '45px',
      height: '40px',
      backgroundColor:'#F8DDE1',
      border: '1px solid #c33c3c',
      color:  '#923535',
      fontWeight: 600,
      boxShadow: 'none',
      mr: 1,
      width: '200px',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor:  '#c33c3c',
        border: '1px solid #c33c3c',
        color:  '#fff',
      },
    }}
  >
    Download as PDF
  </Button>

  <Button 
    variant="contained" 
    color="secondary" 
    onClick={() => downloadExcelDTR(user, attendanceData, selectedItems)} 
    sx={{ 
      borderRadius: '45px',
      height: '40px',
      backgroundColor:'#e3efdf',
      border: '1px solid #00590d',
      color:  '#242005',
      fontWeight: 600,
      boxShadow: 'none',
      mr: 1,
      width: '200px',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor:  '#157744',
        border: '1px solid #157744',
        color:  '#fff',
      },
    }}
  >
    Download as Excel
  </Button>
  </Box>
  
</Box>

<ResponsiveContainer width="100%" height={400}>
  {chartFilter === "All" ? (
    <BarChart data={generateChartData()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis allowDecimals={false} />
      <RechartsTooltip />
      <Legend />
      <Bar dataKey="Late" fill="#FFA726" />
      <Bar dataKey="Absent" fill="#EF5350" />
      <Bar dataKey="Attended" fill="#66BB6A" />
    </BarChart>
  ) : (
    <LineChart data={generateChartData()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis allowDecimals={false} />
      <RechartsTooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey={chartFilter}
        stroke={
          chartFilter === "Late"
            ? "#FFA726"
            : chartFilter === "Absent"
            ? "#EF5350"
            : "#66BB6A"
        }
        strokeWidth={2}
      />
    </LineChart>
  )}
</ResponsiveContainer>



        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
              <TableCell><Checkbox checked={selectAll} onChange={handleSelectAll} color="primary" /></TableCell>
                <TableCell sx={{fontWeight:600}}>Academic Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {attendanceData.map(({ acadYear, semesters }) => (
                <React.Fragment key={acadYear}>
                  <TableRow>
                    <TableCell padding="checkbox" >
                      
                      <Checkbox checked={selectedItems[acadYear] || false} onChange={() => toggleSelect(acadYear)} sx={{ml:1.5}}/>
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
                                  <TableCell colSpan={3}>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Course</TableCell>
                                          <TableCell>Time In</TableCell>
                                          <TableCell>Time Out</TableCell>
                                          <TableCell>Late Status</TableCell>
                                      
                                          <TableCell>Total Hours</TableCell>
                                     
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {Object.entries(details).map(([course, record]) => (
                                          <TableRow key={course}>
                                            <TableCell>{course}</TableCell>
                                            <TableCell>{record.time_in}</TableCell>
                                            <TableCell>{record.time_out}</TableCell>
                                            <TableCell>{record.late_status}</TableCell>
                                            <TableCell>{record.total_hours}</TableCell>
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
                    ))}
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
