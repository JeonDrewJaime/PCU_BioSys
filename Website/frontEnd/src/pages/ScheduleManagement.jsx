import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Collapse, IconButton, Button, Dialog, DialogContent, DialogTitle
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddSchedule from './AddSchedule';
import { fetchScheduleData } from '../../APIs/adminAPI'; // Import API function

const ScheduleManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openRows, setOpenRows] = useState({});
  const [openInstructorRows, setOpenInstructorRows] = useState({});
  const [openAddScheduleDialog, setOpenAddScheduleDialog] = useState(false);

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
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenAddScheduleDialog(true)}
        sx={{
          mb: '20px',
          borderRadius: '45px',
          height: '40px',
          width: '200px',
          backgroundColor: '#E4E4F1',
          borderColor: '#012763',
          color: '#012763',
          fontWeight: 600,
        }}
      >
        Add Schedule
      </Button>

      <Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Academic Year</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Instructors</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {academicYears.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, yearIndex) =>
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
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={openRows[`${yearIndex}-${semIndex}`]} timeout="auto" unmountOnExit>
                          <Table>
                            <TableBody>
                              {semester.instructors.map((instructor, instIndex) => (
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
                                    <TableCell colSpan={3}>
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
    </>
  );
};
export default ScheduleManagement;