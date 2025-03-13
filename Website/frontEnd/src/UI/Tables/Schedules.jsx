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
  const [instructorOrder, setInstructorOrder] = useState('asc');

  const handleSort = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };
  
  const sortedData = [...filteredData].sort((a, b) => {
    return order === 'asc'
      ? a.acadYear.localeCompare(b.acadYear)
      : b.acadYear.localeCompare(a.acadYear);
  }).map(year => ({
    ...year,
    semesters: year.semesters.map(semester => ({
      ...semester,
      instructors: [...semester.instructors].sort((a, b) => {
        return instructorOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }),
    })),
  }));
  

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
           
              <TableCell>Instructors</TableCell>
        
            </TableRow>
          </TableHead>
          <TableBody>
  {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, yearIndex) => (
    <React.Fragment key={`${yearIndex}`}>
      {/* ✅ Academic Year Row */}
      <TableRow>
        <TableCell>
          <Checkbox
            checked={selectedRows.some((key) => key.startsWith(`${yearIndex}-`))}
            onChange={() => {
              const allSemesterKeys = year.semesters.map((_, semIndex) => `${yearIndex}-${semIndex}`);
              const isAllSelected = allSemesterKeys.every((key) => selectedRows.includes(key));
              
              let updatedSelectedRows = [...selectedRows];
              if (isAllSelected) {
                updatedSelectedRows = updatedSelectedRows.filter(
                  (key) => !allSemesterKeys.includes(key)
                );
              } else {
                updatedSelectedRows = [...new Set([...updatedSelectedRows, ...allSemesterKeys])];
              }

              onSelectRow(updatedSelectedRows);
            }}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={() => handleRowClick(`${yearIndex}`)}>
            <ExpandMoreIcon />
          </IconButton>
          {year.acadYear}
        </TableCell>

        
      </TableRow>

      {/* ✅ Semester Rows (Collapsible under Academic Year) */}
      <TableRow>
        <TableCell colSpan={5}>
          <Collapse in={openRows[`${yearIndex}`]} timeout="auto" unmountOnExit>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Semester</TableCell>
                  <TableCell>Instructors</TableCell>
                 
                </TableRow>
              </TableHead>
              <TableBody>
                {year.semesters.map((semester, semIndex) => (
                  <React.Fragment key={`${yearIndex}-${semIndex}`}>
                    {/* ✅ Semester Row */}
                    <TableRow>
                      <TableCell sx={{ paddingLeft: "40px" }}>
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
                        <IconButton onClick={() => handleInstructorClick(`${yearIndex}-${semIndex}`)}>
                          <ExpandMoreIcon />
                        </IconButton>
                        {semester.semesterKey}
                      </TableCell>
                      <TableCell>{semester.instructors.length}</TableCell>
                 
                    </TableRow>

                    {/* ✅ Instructors Collapsible under Semester */}
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Collapse in={openInstructorRows[`${yearIndex}-${semIndex}`]} timeout="auto" unmountOnExit>
                          <Table size="small">
                          <TableHead>
                            <TableRow>
                            <TableCell>
  <TableSortLabel
    active
    direction={instructorOrder}
    onClick={() => setInstructorOrder(instructorOrder === 'asc' ? 'desc' : 'asc')}
  >
    Instructors
  </TableSortLabel>
  </TableCell>
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
                                            <TableCell>Units</TableCell>
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
