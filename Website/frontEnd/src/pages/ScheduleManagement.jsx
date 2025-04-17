import React, { useState } from 'react';
import {
  Box, Paper, Button, Dialog, DialogContent, DialogTitle, Typography, FormControl, Select, MenuItem, InputLabel, IconButton, Checkbox, Menu, TextField,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddSchedule from '../UI/Dialogs/AddSchedule';
import Schedules from '../UI/Tables/Schedules';
import { downloadExcelSchedule } from '../../utils/downloadExcel';
import { downloadPDFSchedule } from '../../utils/downloadPDF';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchScheduleData, deleteAcademicYear, deleteSemesters, deleteMultipleAcademicYears, deleteCoursesByInstructorNames} from '../../APIs/adminAPI';
import { FileDownload } from '@mui/icons-material';
import BulkEditInstructors from '../UI/Dialogs/BulkEditInstructors';


const ScheduleManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openRows, setOpenRows] = useState({});
  const [openInstructorRows, setOpenInstructorRows] = useState({});
  const [openAddScheduleDialog, setOpenAddScheduleDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [openBulkEditDialog, setOpenBulkEditDialog] = useState(false);
  const [bulkEditInstructors, setBulkEditInstructors] = useState([]);
  const [bulkEditContext, setBulkEditContext] = useState({ academicYear: '', semester: '', instructors: [] });

  const [anchorEl, setAnchorEl] = useState(null);

  const queryClient = useQueryClient();

  const handleBulkEdit = () => {
    const instructors = [];
    let academicYear = '';
    let semesterKey = '';
  
    selectedRows.forEach((key) => {
      const [yearIndex, semIndex, instIndex] = key.split('-');
      const year = filteredData[yearIndex];
      const semester = year?.semesters[semIndex];
      const instructor = semester?.instructors[instIndex];
  
      if (instructor) {
        instructors.push(instructor);
      }
  
      if (!academicYear && year?.acadYear) academicYear = year.acadYear;
      if (!semesterKey && semester?.semesterKey) semesterKey = semester.semesterKey;
    });
  
    console.log("✏️ Bulk Edit Context:", { academicYear, semesterKey, instructors });
  
    setBulkEditContext({ academicYear, semester: semesterKey, instructors });
    setOpenBulkEditDialog(true);
  };
  
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

const handleDelete = async () => {
  const semesterMap = new Map(); // key = academicYear, value = Set of semesters
  const academicYearsToDelete = new Set(); // Set of academic years to delete entirely
  const instructorsToDelete = new Set(); // Set to track selected instructors
  const semesterDetails = []; // Array to store the academic year and semester details for deletion

  // Group selected rows by academic year, semester, and instructor
  selectedRows.forEach((key) => {
    const [yearIndex, semIndex, instIndex] = key.split('-');
    const year = academicYears[yearIndex];
    const semester = year?.semesters[semIndex];
    const academicYear = year?.acadYear;
    const semesterKey = semester?.semesterKey;
    const instructor = semester?.instructors[instIndex];

    if (academicYear && semesterKey) {
      // Group semesters by academic year
      if (!semesterMap.has(academicYear)) {
        semesterMap.set(academicYear, new Set());
      }
      semesterMap.get(academicYear).add(semesterKey);

      // Collect instructors to delete
      if (instructor) {
        instructorsToDelete.add(instructor.name);
        // Store the academic year and semester details for instructor deletion
        semesterDetails.push({ academicYear, semesterKey });
      }
    }
  });

  // Check if all academic years and semesters are selected
  const allYearsSelected = semesterMap.size === academicYears.length;
  const allSemestersSelected = Array.from(semesterMap.values()).every((semesters) => semesters.size === academicYears[0]?.semesters.length);

  // If all academic years and semesters are selected and there are selected instructors, delete courses for instructors
  if (allYearsSelected && allSemestersSelected && instructorsToDelete.size > 0) {
    try {
      // Call function to delete courses by instructors with academic year and semester
      await deleteCoursesByInstructorNames(Array.from(instructorsToDelete), semesterDetails[0].academicYear, semesterDetails[0].semesterKey);
      console.log(`✅ Deleted courses for instructors: ${Array.from(instructorsToDelete).join(', ')}`);
    } catch (err) {
      console.error(`❌ Failed to delete courses for instructors:`, err);
    }
  } else {
    // Check for academic years to delete fully (if all semesters are selected)
    semesterMap.forEach((semestersSet, academicYear) => {
      const year = academicYears.find((yr) => yr.acadYear === academicYear);
      const allSemesters = year?.semesters.map((sem) => sem.semesterKey);

      if (allSemesters && allSemesters.length === semestersSet.size) {
        // If all semesters of this academic year are selected, delete the entire academic year
        academicYearsToDelete.add(academicYear);
      }
    });

    // First, delete entire academic years
    if (academicYearsToDelete.size > 0) {
      try {
        await deleteMultipleAcademicYears(Array.from(academicYearsToDelete));
        console.log(`✅ Deleted academic years: ${Array.from(academicYearsToDelete).join(', ')}`);
      } catch (err) {
        console.error(`❌ Failed to delete academic years:`, err);
      }
    }

    // Then, delete specific semesters for the remaining years
    for (const [academicYear, semestersSet] of semesterMap.entries()) {
      if (!academicYearsToDelete.has(academicYear)) { // Skip already deleted academic years
        const semesters = Array.from(semestersSet);
        try {
          await deleteSemesters(academicYear, semesters);
          console.log(`✅ Deleted semesters ${semesters.join(', ')} from ${academicYear}`);
        } catch (err) {
          console.error(`❌ Failed to delete semesters from ${academicYear}:`, err);
        }
      }
    }
  }

  // Clear selected rows after deletion
  setSelectedRows([]);
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
        <Typography gutterBottom sx={{ color: "#041129", mt: -1, mb: 2, fontSize: "16px" }}>
        Keep your team’s availability and instructional time on track with a clear breakdown of daily teaching schedules.
            </Typography>
      <Paper sx={{ padding: 2, border: "1px solid #D6D7D6", boxShadow: "none" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
          <FormControl sx={{ minWidth: 120 }} size="small">
  <InputLabel>Actions</InputLabel>
  <Select
  value=""
  onChange={(e) => {
    const action = e.target.value;
    if (action === "edit") {
      handleBulkEdit();
    } else if (action === "delete") {
      handleDelete();
    }
  }}
  displayEmpty
>
  
  <MenuItem value="edit" disabled={selectedRows.length === 0}>
    Edit
  </MenuItem>
  <MenuItem value="delete" disabled={selectedRows.length === 0}>
    Delete
  </MenuItem>
</Select>

</FormControl>
          

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


<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
>
  <MenuItem onClick={() => {
    handleClose();
    const selectedData = selectedRows.map((key) => {
      const [yearIndex, semIndex, instIndex] = key.split('-');
      const year = filteredData[yearIndex];
      const semester = year.semesters[semIndex];
      const instructor = semester.instructors[instIndex];  // Get the specific instructor
  
      return {
        acadYear: year.acadYear,
        semesterKey: semester.semesterKey,
        instructors: instructor ? [instructor] : []  // Only include the selected instructor
      };
    });

    downloadExcelSchedule(selectedData);
  }}>
    Download Excel
  </MenuItem>

  <MenuItem onClick={() => {
    handleClose();
    const selectedData = selectedRows.map((key) => {
      const [yearIndex, semIndex, instIndex] = key.split('-');
      const year = filteredData[yearIndex];
      const semester = year.semesters[semIndex];
      const instructor = semester.instructors[instIndex];  // Get the specific instructor
  
      return {
        acadYear: year.acadYear,
        semesterKey: semester.semesterKey,
        instructors: instructor ? [instructor] : []  // Only include the selected instructor
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
  handleDeleteAcademicYear={handleDelete}
  setPage={setPage}
  setRowsPerPage={setRowsPerPage}
  onSelectRow={setSelectedRows}
  selectedRows={selectedRows}   
/>
      </Paper>

      <Dialog open={openAddScheduleDialog} onClose={() => setOpenAddScheduleDialog(false)} maxWidth="Lg" fullWidth>
        <DialogTitle sx={{bgcolor: "#f5f5fb"}}>
          <IconButton
            aria-label="close"
            onClick={() => setOpenAddScheduleDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, bgcolor: "#f5f5fb" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{bgcolor: "#f5f5fb"}}>
          <AddSchedule onClose={() => setOpenAddScheduleDialog(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={openBulkEditDialog} onClose={() => setOpenBulkEditDialog(false)} maxWidth="md" fullWidth>

</Dialog>
<BulkEditInstructors
  open={openBulkEditDialog}
  onClose={() => setOpenBulkEditDialog(false)}
  instructors={bulkEditContext.instructors}
  academicYear={bulkEditContext.academicYear}
  semester={bulkEditContext.semester}
  setInstructors={(newInstructors) =>
    setBulkEditContext((prev) => ({ ...prev, instructors: newInstructors }))
  }
/>

    </>

  );
};

export default ScheduleManagement;