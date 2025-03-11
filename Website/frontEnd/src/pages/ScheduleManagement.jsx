import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Button, Dialog, DialogContent, DialogTitle, Typography, FormControl, Select, MenuItem, InputLabel, IconButton, Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddSchedule from '../UI/Dialogs/AddSchedule';
import { fetchScheduleData, deleteAcademicYear } from '../../APIs/adminAPI';
import Schedules from '../UI/Tables/Schedules';
import { downloadExcelSchedule } from '../../utils/downloadExcel';
import { downloadPDFSchedule } from '../../utils/downloadPDF';

const ScheduleManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openRows, setOpenRows] = useState({});
  const [openInstructorRows, setOpenInstructorRows] = useState({});
  const [openAddScheduleDialog, setOpenAddScheduleDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const handleDeleteAcademicYear = async (academicYear) => {
    try {
      await deleteAcademicYear(academicYear);
      setAcademicYears((prev) => prev.filter((year) => year.acadYear !== academicYear));
    } catch (error) {
      console.error('Error deleting academic year:', error);
    }
  };

  const filteredData = academicYears
    .filter((year) => (selectedYear ? year.acadYear === selectedYear : true))
    .map((year) => ({
      ...year,
      semesters: year.semesters.filter((semester) =>
        selectedSemester ? semester.semesterKey === selectedSemester : true
      ),
    }));

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchScheduleData();
        setAcademicYears(data);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };
    fetchData();
  }, []);

  // Close Add Schedule Dialog
  const handleCloseAddScheduleDialog = () => {
    setOpenAddScheduleDialog(false);
  };
  const handleSelectedRows = (rows) => {

    setSelectedRows(rows);
  };
  // Unique Academic Years and Semesters
  const uniqueAcademicYears = [...new Set(academicYears.map(year => year.acadYear))];
  const uniqueSemesters = [...new Set(academicYears.flatMap(year => year.semesters.map(sem => sem.semesterKey)))];

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: "#041129", fontWeight: "bold" }}>
        Schedules
      </Typography>
      <Typography gutterBottom sx={{ color: "#041129", mt: -1, mb: 2, fontSize: "16px" }}>
        Here’s a quick view of your team’s upcoming schedules and assignments. Stay organized and ensure smooth operations.
      </Typography>

      <Paper sx={{ padding: 2, border: "1px solid #D6D7D6", boxShadow: "none" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: "20px" }}>
          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2 }}>

          <Checkbox
  indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.flatMap(y => y.semesters).length}
  checked={selectedRows.length === filteredData.flatMap(y => y.semesters).length}
  onChange={(e) => {
    const allRows = e.target.checked 
      ? filteredData.flatMap((y, yi) => 
          y.semesters.map((_, si) => `${yi}-${si}`))
      : [];
    setSelectedRows(allRows);
    onSelectRow(allRows.map(k => {
      const [yi, si] = k.split('-');
      return { 
        acadYear: filteredData[yi].acadYear, 
        semesterKey: filteredData[yi].semesters[si].semesterKey, 
        instructors: filteredData[yi].semesters[si].instructors 
      };
    }));
  }}
/>

            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Academic Year</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {uniqueAcademicYears.map((year, index) => (
                  <MenuItem key={index} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Semester</InputLabel>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {uniqueSemesters.map((semester, index) => (
                  <MenuItem key={index} value={semester}>
                    {semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Add Schedule Button */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button
    variant="contained"
    color="secondary"
    onClick={() => downloadPDFSchedule(selectedRows)} 
    disabled={selectedRows.length === 0}
    sx={{
      borderRadius: "45px",
      height: "40px",
      backgroundColor: selectedRows.length > 0 ? "#FFEFEF" : "#F0F0F0",
      border: "1px solid #041129",
      color: "#041129",
      fontWeight: 600,
      boxShadow: "none",
    }}
  >
    Download PDF
  </Button>

  <Button 
  variant="contained" 
  color="success" 
  onClick={() => downloadExcelSchedule(selectedRows)} 
  disabled={selectedRows.length === 0}
  sx={{
    borderRadius: "45px",
    height: "40px",
    backgroundColor: selectedRows.length > 0 ? "#4CAF50" : "#F0F0F0", // Green when enabled, gray when disabled
    border: "1px solid #041129",
    color: selectedRows.length > 0 ? "#fff" : "#041129", // White text when enabled
    fontWeight: 600,
    boxShadow: "none",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: selectedRows.length > 0 ? "#388E3C" : "#F0F0F0"
    }
  }}
>
  Download Excel
</Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenAddScheduleDialog(true)}
              sx={{
                borderRadius: "45px",
                height: "40px",
                width: "200px",
                backgroundColor: "#EFF6FB",
                border: "1px solid #041129",
                color: "#041129",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              Add Schedule
            </Button>
          </Box>
        </Box>

        <Schedules
  filteredData={filteredData} // ✅ Updated to use filtered data
  page={page}
  rowsPerPage={rowsPerPage}
  openRows={openRows}
  openInstructorRows={openInstructorRows}
  handleRowClick={(index) => setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }))}
  handleInstructorClick={(name) => setOpenInstructorRows((prev) => ({ ...prev, [name]: !prev[name] }))}
  handleDeleteAcademicYear={handleDeleteAcademicYear}
  setPage={setPage}
  setRowsPerPage={setRowsPerPage}
  onSelectRow={handleSelectedRows}
/>
      </Paper>

      {/* Add Schedule Dialog */}
      <Dialog open={openAddScheduleDialog} onClose={handleCloseAddScheduleDialog} maxWidth="xl" fullWidth>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseAddScheduleDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddSchedule onClose={handleCloseAddScheduleDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScheduleManagement;
