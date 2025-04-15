import React, { useState, useEffect  } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Collapse, IconButton, Checkbox, TableSortLabel, Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Delete } from '@mui/icons-material';
import AOS from "aos";
import "aos/dist/aos.css";


const Schedules = ({
  filteredData, page, rowsPerPage, openRows, openInstructorRows,
  handleRowClick, handleInstructorClick, handleDeleteAcademicYear, setPage, setRowsPerPage,
  onSelectRow, selectedRows  // ✅ Now pass selectedRows from parent
}) => {
 
  const [order, setOrder] = useState('asc');
  const [instructorOrder, setInstructorOrder] = useState('asc');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
      once: true,
    });
  }, []);

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
  const isSelected = (key) => {
    return Array.isArray(selectedRows) && selectedRows.some(rowKey => rowKey?.startsWith?.(key));
  };
  

  return (
    <Box sx={{ boxShadow: 'none',}}>
      <TableContainer component={Paper} sx={{ border: "1px solid #cccccc", boxShadow: "none",  borderLeft: "1px solid #ffffff", borderRight: "1px solid #ffffff",  }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#FFffff" }}>
            <TableRow>
            <TableCell padding='checkbox'>

  <Checkbox sx={{ml:1.5}}
    checked={selectedRows.length > 0 && selectedRows.length === filteredData.reduce((acc, year, yearIndex) => {
      return acc + year.semesters.reduce((semAcc, semester, semIndex) => {
        return semAcc + semester.instructors.length;
      }, 0);
    }, 0)}
    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.reduce((acc, year, yearIndex) => {
      return acc + year.semesters.reduce((semAcc, semester, semIndex) => {
        return semAcc + semester.instructors.length;
      }, 0);
    }, 0)}
    onChange={() => {
      let allKeys = [];

      filteredData.forEach((year, yearIndex) => {
        year.semesters.forEach((semester, semIndex) => {
          semester.instructors.forEach((_, instIndex) => {
            allKeys.push(`${yearIndex}-${semIndex}-${instIndex}`);
          });
        });
      });

      let updatedSelectedRows = selectedRows.length === allKeys.length ? [] : allKeys;
      onSelectRow(updatedSelectedRows);
    }}
  />

  <Typography variant="body2" sx={{textAlign:"center", fontSize:"10px", mb:0.5 }}>
    {selectedRows.length > 0 
      ? `${selectedRows.length} ${selectedRows.length === 1 ? 'row' : 'rows'} selected`
      : ''}
  </Typography>

</TableCell>


              <TableCell 
              sx={{ fontWeight: 600,
          color: "#041129",
          fontSize:"17px",}}>

      <TableSortLabel sx={{
            color: "#041129", 
            "&.MuiTableSortLabel-root": {
              color: "#041129 !important", 
            },
            "& .MuiTableSortLabel-icon": {
              color: "#041129 !important", 
            },
          }}
        active
        direction={order}
        onClick={handleSort}
      >
        Academic Year
      </TableSortLabel>
    </TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
  {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, yearIndex) => (
    <React.Fragment key={`${yearIndex}`}>
      {/* ✅ Academic Year Row */}
      <TableRow >
        <TableCell>
          <Checkbox
            checked={year.semesters.every((semester, semIndex) =>
              semester.instructors.every((_, instIndex) =>
                selectedRows.includes(`${yearIndex}-${semIndex}-${instIndex}`)
              )
            )}
            indeterminate={
              year.semesters.some((semester, semIndex) =>
                semester.instructors.some((_, instIndex) =>
                  selectedRows.includes(`${yearIndex}-${semIndex}-${instIndex}`)
                )
              ) &&
              !year.semesters.every((semester, semIndex) =>
                semester.instructors.every((_, instIndex) =>
                  selectedRows.includes(`${yearIndex}-${semIndex}-${instIndex}`)
                )
              )
            }
            onChange={() => {
              let allKeys = [];
              year.semesters.forEach((semester, semIndex) => {
                semester.instructors.forEach((_, instIndex) => {
                  allKeys.push(`${yearIndex}-${semIndex}-${instIndex}`);
                });
              });

              const isAllSelected = allKeys.every((key) => selectedRows.includes(key));
              let updatedSelectedRows = [...selectedRows];

              if (isAllSelected) {
                updatedSelectedRows = updatedSelectedRows.filter((key) => !allKeys.includes(key));
              } else {
                updatedSelectedRows = [...new Set([...updatedSelectedRows, ...allKeys])];
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
      <TableRow >
        <TableCell colSpan={5} >
          <Collapse in={openRows[`${yearIndex}`]} timeout="auto" unmountOnExit>
            <Table>
              <TableHead >
                <TableRow >
                  <TableCell sx={{ fontWeight: 600,
          color: "#041129", paddingLeft: "32px",
          fontSize:"17px"}}data-aos="fade-right">Semester</TableCell>
                  <TableCell sx={{ fontWeight: 600,
          color: "#041129",
          fontSize:"17px"}} data-aos="fade-right">Instructors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {year.semesters.map((semester, semIndex) => (
                  <React.Fragment key={`${yearIndex}-${semIndex}`}>
                    {/* ✅ Semester Row */}
                    <TableRow >
                      <TableCell sx={{ paddingLeft: "32px" }}>
                        <Checkbox
                          checked={semester.instructors.every((_, instIndex) =>
                            selectedRows.includes(`${yearIndex}-${semIndex}-${instIndex}`)
                          )}
                          indeterminate={semester.instructors.some((_, instIndex) =>
                            selectedRows.includes(`${yearIndex}-${semIndex}-${instIndex}`)
                          )}
                          onChange={() => {
                            let allKeys = [];
                            semester.instructors.forEach((_, instIndex) => {
                              allKeys.push(`${yearIndex}-${semIndex}-${instIndex}`);
                            });

                            const isAllSelected = allKeys.every((key) => selectedRows.includes(key));
                            let updatedSelectedRows = [...selectedRows];

                            if (isAllSelected) {
                              updatedSelectedRows = updatedSelectedRows.filter((key) => !allKeys.includes(key));
                            } else {
                              updatedSelectedRows = [...new Set([...updatedSelectedRows, ...allKeys])];
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
                                <TableCell sx={{ fontWeight: 600,
          color: "#041129",
          fontSize:"17px"}}>
                                  <TableSortLabel sx={{
            color: "#041129", 
            "&.MuiTableSortLabel-root": {
              color: "#041129 !important", 
            },
            "& .MuiTableSortLabel-icon": {
              color: "#041129 !important", 
            },
          }}
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
                                      <Checkbox
                                        checked={selectedRows.includes(`${yearIndex}-${semIndex}-${instIndex}`)}
                                        onChange={() => {
                                          const key = `${yearIndex}-${semIndex}-${instIndex}`;
                                          const updatedSelectedRows = selectedRows.includes(key)
                                            ? selectedRows.filter((rowKey) => rowKey !== key)
                                            : [...selectedRows, key];
                                          onSelectRow(updatedSelectedRows);
                                        }}
                                      />
                                      <IconButton onClick={() => handleInstructorClick(instructor.name)}>
                                        <ExpandMoreIcon />
                                      </IconButton>
                                      {instructor.name}
                                    </TableCell>

                                    <TableCell colSpan={7}>
                                      <Collapse in={openInstructorRows[instructor.name]} timeout="auto" unmountOnExit>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow >
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Course Code</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Description</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Curriculum</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Section</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Room</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Day</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Total Units</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">Start Time</TableCell>
                                              <TableCell sx={{ fontWeight: 600 }}data-aos="fade-right">End Time</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                              {instructor.courses.map((course, cIdx) => (
                                                <TableRow
                                                  key={cIdx}
                                                  sx={{
                                                    backgroundColor: cIdx % 2 === 0 ? '#f2f2f4' : 'white',
                                                  }}
                                                >
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
