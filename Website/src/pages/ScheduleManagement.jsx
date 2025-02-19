import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Collapse, IconButton, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider
} from '@mui/material';
import { get, ref, database } from '../../utils/firebase-config';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddSchedule from './AddSchedule';  // Import AddSchedule component

const ScheduleManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openRows, setOpenRows] = useState({});
  const [openInstructorRows, setOpenInstructorRows] = useState({}); // State for instructor collapses
  const [openAddScheduleDialog, setOpenAddScheduleDialog] = useState(false);  // State to control dialog visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scheduleRef = ref(database, 'schedule_testing/academic_years/');
        const snapshot = await get(scheduleRef);
  
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedData = Object.keys(data).map((acadYear) => {
            const semesters = data[acadYear]?.semesters || {};
            return {
              acadYear,
              semesters: Object.keys(semesters).map((semesterKey) => {
                const semesterData = semesters[semesterKey];
                const instructors = {};
  
                semesterData.courses.forEach((course) => {
                  if (Array.isArray(course.instructors)) {
                    course.instructors.forEach((instructor) => {
                      if (!instructors[instructor.name]) {
                        instructors[instructor.name] = {
                          name: instructor.name,
                          courses: [],
                        };
                      }
                     
                      const section = course.schedule?.[0]?.section || 'Unknown Section'; 
                      instructors[instructor.name].courses.push({
                        courseCode: course.course_code || 'Unknown Code',
                        courseDescription: course.course_description || 'No Description',
                        curriculum: course.curriculum || 'Unknown Curriculum',
                        section: section,
                      });
                    });
                  }
                });
  
                return {
                  semesterKey,
                  instructors: Object.values(instructors),
                };
              }),
            };
          });
  
          setAcademicYears(formattedData);
        } else {
          console.log('No data found');
        }
      } catch (error) {
        console.error('Error fetching schedule data from Firebase:', error);
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
    setOpenAddScheduleDialog(false);  // Close the AddSchedule dialog
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenAddScheduleDialog(true)}  // Open AddSchedule dialog
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
              {academicYears.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, yearIndex) => (
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
                          <Box margin={1}>
                            {semester.instructors.map((instructor, idx) => (
                              <Box key={idx} marginBottom={2}>
                                
                                <Typography  color="black">
                                <IconButton onClick={() => handleInstructorClick(instructor.name)}>
                                  <ExpandMoreIcon />
                                </IconButton>
                                  {instructor.name}</Typography>
                                 <Divider/>
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
                                        <TableCell>Starting Time</TableCell>
                                        <TableCell>Ending Time</TableCell>
                                        <TableCell>Total Units</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {instructor.courses.map((course, cIdx) => (
                                        <TableRow key={cIdx}>
                                          <TableCell>{course.courseCode}</TableCell>
                                          <TableCell>{course.courseDescription}</TableCell>
                                          <TableCell>{course.curriculum}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Collapse>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ))}
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
