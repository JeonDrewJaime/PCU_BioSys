import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Collapse, IconButton, Checkbox, TableSortLabel, Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Delete } from '@mui/icons-material';

const Schedules = ({
  filteredData, page, rowsPerPage, openRows, openInstructorRows,
  handleRowClick, handleInstructorClick, handleDeleteAcademicYear, setPage, setRowsPerPage,
  onSelectRow, selectedRows  // ✅ Now pass selectedRows from parent
}) => {
 
  const [order, setOrder] = useState('asc');

  const handleSort = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };
  
  const sortedData = [...filteredData].sort((a, b) => {
    return order === 'asc'
      ? a.acadYear.localeCompare(b.acadYear)
      : b.acadYear.localeCompare(a.acadYear);
  });
const handleSelectRow = (yearIndex, semIndex) => {
  const key = `${yearIndex}-${semIndex}`;
  let updatedSelectedRows = [...selectedRows];

  if (updatedSelectedRows.includes(key)) {
    updatedSelectedRows = updatedSelectedRows.filter((row) => row !== key);
  } else {
    updatedSelectedRows.push(key);
  }

  // ✅ Capture BOTH the Academic Year + Semester
  onSelectRow(updatedSelectedRows.map((key) => {
    const [yIndex, sIndex] = key.split('-');
    const year = filteredData[yIndex]; // Get the academic year
    const semester = year.semesters[sIndex]; // Get the semester
    return {
      acadYear: year.acadYear,
      semesterKey: semester.semesterKey,
      instructors: semester.instructors
    };
  }));
  setSelectedRows(updatedSelectedRows);
};


  return (
    <Box>
      <TableContainer component={Paper} sx={{border: "1px solid #D6D7D6", boxShadow: "none"}}>
        <Table>
          <TableHead sx={{backgroundColor: "#CEE3F3"}}>
            <TableRow>
            <TableCell >
  
  <Typography variant="body2" >
    {selectedRows.length > 0 
      ? `${selectedRows.length} ${selectedRows.length === 1 ? 'row' : 'rows'} selected`
      : ''}
  </Typography>
</TableCell>

              <TableCell>
      <TableSortLabel
        active
        direction={order}
        onClick={handleSort}
      >
        Academic Year
      </TableSortLabel>
    </TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Instructors</TableCell>
        
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, yearIndex) =>
              year.semesters.map((semester, semIndex) => (
                <React.Fragment key={`${yearIndex}-${semIndex}`}>
                  <TableRow>
                    <TableCell>
                    <Checkbox
  checked={selectedRows.includes(`${yearIndex}-${semIndex}`)}
  onChange={() => {
    const key = `${yearIndex}-${semIndex}`;
    let updatedSelectedRows = [...selectedRows];

    if (updatedSelectedRows.includes(key)) {
      updatedSelectedRows = updatedSelectedRows.filter((row) => row !== key);
    } else {
      updatedSelectedRows.push(key);
    }

    onSelectRow(updatedSelectedRows);
  }}
/>



                    </TableCell>
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
                    <TableCell colSpan={5}>
                      <Collapse in={openRows[`${yearIndex}-${semIndex}`]} timeout="auto" unmountOnExit>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Instructor</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          {semester.instructors.map((instructor, instIndex) => (
                              <React.Fragment key={instIndex}>
                                {/* ✅ Instructor Row */}
                                <TableRow>
                                  <TableCell>
                                    <IconButton onClick={() => handleInstructorClick(instructor.name)}>
                                      <ExpandMoreIcon />
                                    </IconButton>
                                    {instructor.name}
                                  </TableCell>

                                  <TableCell colSpan={7}>
                                    <Collapse in={openInstructorRows[instructor.name]} timeout="auto" unmountOnExit>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Course Code</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Curriculum</TableCell>
                                            <TableCell>Section</TableCell>
                                            <TableCell>Room</TableCell>
                                            <TableCell>Day</TableCell>
                                            <TableCell>Total Units</TableCell>
                                            <TableCell>Start Time</TableCell>
                                            <TableCell>End Time</TableCell>
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
                                              <TableCell>{course.schedule.total_units || 'N/A'}</TableCell>
                                              <TableCell>{course.schedule.start_time || 'N/A'}</TableCell>
                                              <TableCell>{course.schedule.end_time || 'N/A'}</TableCell>
                  
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

      {/* ✅ Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
};

export default Schedules;
