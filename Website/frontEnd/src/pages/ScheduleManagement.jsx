import React, { useState } from 'react';
import {
  Box, Paper, Button, Dialog, DialogContent, DialogTitle, Typography, FormControl, Select, MenuItem, InputLabel, IconButton, Checkbox, Menu, 
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddSchedule from '../UI/Dialogs/AddSchedule';
import Schedules from '../UI/Tables/Schedules';
import { downloadExcelSchedule } from '../../utils/downloadExcel';
import { downloadPDFSchedule } from '../../utils/downloadPDF';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchScheduleData, deleteAcademicYear } from '../../APIs/adminAPI';
import { FileDownload } from '@mui/icons-material';

const ScheduleManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openRows, setOpenRows] = useState({});
  const [openInstructorRows, setOpenInstructorRows] = useState({});
  const [openAddScheduleDialog, setOpenAddScheduleDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  
const [anchorEl, setAnchorEl] = useState(null);

  const queryClient = useQueryClient();

  const { data: academicYears = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchScheduleData
  });

  
const handleExportClick = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleClose = () => {
  setAnchorEl(null);
};
  const deleteMutation = useMutation({
    mutationFn: deleteAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
    }
  });

  const handleDeleteAcademicYear = (academicYear) => {
    deleteMutation.mutate(academicYear);
  };

  const filteredData = academicYears
    .filter((year) => (selectedYear ? year.acadYear === selectedYear : true))
    .map((year) => ({
      ...year,
      semesters: year.semesters.filter((semester) =>
        selectedSemester ? semester.semesterKey === selectedSemester : true
      ),
    }));

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };

  const uniqueAcademicYears = [...new Set(academicYears.map(year => year.acadYear))];
  const uniqueSemesters = [...new Set(academicYears.flatMap(year => year.semesters.map(sem => sem.semesterKey)))];

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: "#041129", fontWeight: "bold" }}>
        Schedules
      </Typography>

      <Paper sx={{ padding: 2, border: "1px solid #D6D7D6", boxShadow: "none" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>

        <Checkbox
  indeterminate={
    selectedRows.length > 0 && selectedRows.length < filteredData.reduce((total, year) => total + year.semesters.length, 0)
  }
  checked={
    selectedRows.length === filteredData.reduce((total, year) => total + year.semesters.length, 0)
  }
  onChange={(e) => {
    if (e.target.checked) {
      // Select all rows
      const allRows = filteredData.flatMap((year, yearIndex) =>
        year.semesters.map((_, semIndex) => `${yearIndex}-${semIndex}`)
      );
      setSelectedRows(allRows);
    } else {
      // Deselect all
      setSelectedRows([]);
    }
  }}
/>


        <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Academic Year</InputLabel>
            <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {uniqueAcademicYears.map((year, index) => (
                <MenuItem key={index} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Semester</InputLabel>
            <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {uniqueSemesters.map((semester, index) => (
                <MenuItem key={index} value={semester}>{semester}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
  onClick={() => {
    selectedRows.forEach((key) => {
      const [yearIndex, semIndex] = key.split('-');
      const year = filteredData[yearIndex];
      const semester = year.semesters[semIndex];
      
      handleDeleteAcademicYear({
        acadYear: year.acadYear,
        semesterKey: semester.semesterKey
      });
    });
    setSelectedRows([]);
  }}
  disabled={selectedRows.length === 0}
  sx={{
    border: "1px solid #041129",
    color: selectedRows.length > 0 ? "#D32F2F" : "#041129",
    boxShadow: "none",
    backgroundColor: selectedRows.length > 0 ? "#FFEBEE" : "#F0F0F0"
  }}
>
  <Delete />
</IconButton>
<Button
  variant="contained"
  color="primary"
  onClick={handleExportClick}
  disabled={selectedRows.length === 0}
  startIcon={<FileDownload />}
  sx={{
    borderRadius: "45px",
    height: "40px",
    backgroundColor: selectedRows.length > 0 ? "#4CAF50" : "#F0F0F0",
    border: "1px solid #041129",
    color: selectedRows.length > 0 ? "#fff" : "#041129",
    fontWeight: 600,
    boxShadow: "none",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: selectedRows.length > 0 ? "#388E3C" : "#F0F0F0"
    }
  }}
>
  Export
</Button>

{/* ✅ Dropdown Menu */}
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
>
  <MenuItem onClick={() => {
    handleClose();
    const selectedData = selectedRows.map((key) => {
      const [yearIndex, semIndex] = key.split('-');
      const year = filteredData[yearIndex];
      const semester = year.semesters[semIndex];

      return {
        acadYear: year.acadYear,
        semesterKey: semester.semesterKey,
        instructors: semester.instructors
      };
    });

    downloadExcelSchedule(selectedData);
  }}>
    Download Excel
  </MenuItem>

  <MenuItem onClick={() => {
    handleClose();
    const selectedData = selectedRows.map((key) => {
      const [yearIndex, semIndex] = key.split('-');
      const year = filteredData[yearIndex];
      const semester = year.semesters[semIndex];

      return {
        acadYear: year.acadYear,
        semesterKey: semester.semesterKey,
        instructors: semester.instructors
      };
    });

    downloadPDFSchedule(selectedData);
  }}>
    Download PDF
  </MenuItem>
</Menu>

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

        <Schedules
  filteredData={filteredData}
  page={page}
  rowsPerPage={rowsPerPage}
  openRows={openRows}
  openInstructorRows={openInstructorRows}
  handleRowClick={(index) => setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }))}
  handleInstructorClick={(name) => setOpenInstructorRows((prev) => ({ ...prev, [name]: !prev[name] }))}
  handleDeleteAcademicYear={handleDeleteAcademicYear}
  setPage={setPage}
  setRowsPerPage={setRowsPerPage}
  onSelectRow={setSelectedRows}
  selectedRows={selectedRows}   
/>
      </Paper>

      <Dialog open={openAddScheduleDialog} onClose={() => setOpenAddScheduleDialog(false)} maxWidth="Lg" fullWidth>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenAddScheduleDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddSchedule onClose={() => setOpenAddScheduleDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScheduleManagement;