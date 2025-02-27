import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Collapse, IconButton, Button, Dialog, DialogContent, DialogTitle
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddSchedule from '../UI/Dialogs/AddSchedule';
import { ExpandMore, ExpandLess, Delete, Edit, Save, Cancel, Search, Close } from "@mui/icons-material";
import { fetchScheduleData, deleteAcademicYear } from '../../APIs/adminAPI'; // Import API function
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const ScheduleManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openRows, setOpenRows] = useState({});
  const [openInstructorRows, setOpenInstructorRows] = useState({});
  const [openAddScheduleDialog, setOpenAddScheduleDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchScheduleData(); // Fetch from API
        setAcademicYears(data);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (index) => {
    setOpenRows((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleInstructorClick = (instructorName) => {
    setOpenInstructorRows((prevState) => ({
      ...prevState,
      [instructorName]: !prevState[instructorName],
    }));
  };

  const handleCloseAddScheduleDialog = () => {
    setOpenAddScheduleDialog(false);
  };

  return (
    <>
    <Paper sx={{ padding: 2, border: "1px solid #D6D7D6", boxShadow: "none", }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: "20px" }}>
  {/* Select Inputs (Aligned Left) */}
  <Box sx={{ display: "flex", gap: 2 }}>
    <FormControl sx={{ minWidth: 150 }} size="small">
      <InputLabel>Academic Year</InputLabel>
      <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
        <MenuItem value="">All</MenuItem>
        {academicYears.map((year, index) => (
          <MenuItem key={index} value={year.acadYear}>
            {year.acadYear}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <FormControl sx={{ minWidth: 150 }} size="small">
      <InputLabel>Semester</InputLabel>
      <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
        <MenuItem value="">All</MenuItem>
        {academicYears.flatMap((year) => year.semesters).map((semester, index) => (
          <MenuItem key={index} value={semester.semesterKey}>
            {semester.semesterKey}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>

  {/* Button (Docked Right) */}
  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
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


      <Box>
        <TableContainer component={Paper} sx={{border: "1px solid #D6D7D6", boxShadow: "none", }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Academic Year</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Instructors</TableCell>
                <TableCell>Actions</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, yearIndex) =>
        year.semesters.map((semester, semIndex) => (
                  <React.Fragment key={`${yearIndex}-${semIndex}`}>
                    <TableRow>
                      <TableCell>
                        <IconButton onClick={() => handleRowClick(`${yearIndex}-${semIndex}`)}>
                          <ExpandMoreIcon />
                        </IconButton>
                        {year.acadYear}
                      </TableCell>
                      <TableCell>{semester.semesterKey}</TableCell>
                      <TableCell>{semester.instructors.length}</TableCell>
                      <TableCell>
  <IconButton
    variant="contained"
    color="error"
    onClick={() => handleDeleteAcademicYear(year.acadYear)}
  >
    <Delete/>
  </IconButton>
</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell colSpan={3} sx={{ px: 1}}>
                        <Collapse in={openRows[`${yearIndex}-${semIndex}`]} timeout="auto" unmountOnExit>
                          <Table>
                            <TableBody>
                            {semester.instructors.filter(instructor => instructor.name && instructor.name !== 'Unknown Instructor').map((instructor, instIndex) => (

                                <React.Fragment key={instIndex}>
                                  <TableRow>
                                    <TableCell>
                                      <IconButton onClick={() => handleInstructorClick(instructor.name)}>
                                        <ExpandMoreIcon />
                                      </IconButton>
                                      {instructor.name}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                  <TableCell colSpan={3} sx={{ p: 0}}>
                                      <Collapse in={openInstructorRows[instructor.name]} timeout="auto" unmountOnExit>
                                        <Table>
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Course Code</TableCell>
                                              <TableCell>Description</TableCell>
                                              <TableCell>Curriculum</TableCell>
                                              <TableCell>Section</TableCell>
                                              <TableCell>Room</TableCell>
                                              <TableCell>Day</TableCell>
                                              <TableCell>Start Time</TableCell>
                                              <TableCell>End Time</TableCell>
                                              <TableCell>Total Units</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {instructor.courses.map((course, cIdx) => (
                                              <TableRow key={cIdx}>
                                                <TableCell>{course.courseCode}</TableCell>
                                                <TableCell>{course.courseDescription}</TableCell>
                                                <TableCell>{course.curriculum}</TableCell>
                                                <TableCell>{course.schedule.section || 'N/A'}</TableCell>
                                                <TableCell>{course.schedule.room || 'N/A'}</TableCell>
                                                <TableCell>{course.schedule.day || 'N/A'}</TableCell>
                                                <TableCell>{course.schedule.start_time || 'N/A'}</TableCell>
                                                <TableCell>{course.schedule.end_time || 'N/A'}</TableCell>
                                                <TableCell>{course.schedule.total_units || 'N/A'}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={academicYears.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Box>

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
          <AddSchedule />
        </DialogContent>
      </Dialog>
      </Paper>
    </>
  );
};
export default ScheduleManagement;