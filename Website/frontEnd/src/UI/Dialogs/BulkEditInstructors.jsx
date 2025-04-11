import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Paper, Tabs, Tab, Stack, Chip, TextField, Button, Select, MenuItem, Menu, Checkbox } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { getCoursesByInstructorNames, updateCourseAndInstructorName, deleteMultipleCourses} from "../../../APIs/adminAPI";
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en'; // optional, for consistent formatting

const BulkEditInstructors = ({ open, onClose, instructors, academicYear, semester }) => {
  const [fetchedCourses, setFetchedCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [value, setValue] = useState(0);

  // Fetch data when the dialog is opened
  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!open || !academicYear || !semester || instructors.length === 0) return;

      try {
        const instructorNames = instructors.map((i) => i.name);
        const data = await getCoursesByInstructorNames(instructorNames, academicYear, semester);

        setFetchedCourses(data.data); // Update fetched courses data
      } catch (error) {
        console.error("Failed to fetch instructor courses:", error);
      }
    };

    fetchInstructorCourses();
  }, [open, instructors, academicYear, semester]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

 
  const handleTextFieldChange = (courseId, field, value) => {
    setFetchedCourses((prevCourses) => 
      prevCourses.map((course) => 
        course.id === courseId ? {
          ...course,
          [field]: value,  // Update the field with the new value
          instructors: course.instructors.map((instructor) =>
            instructor.schedule && instructor.schedule[field] !== undefined
              ? { ...instructor, schedule: { ...instructor.schedule, [field]: value } }
              : instructor
          )
        } : course
      )
    );
  };
  
  const handleCheckboxChange = (id) => {
    setSelectedCourses((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((courseId) => courseId !== id)
        : [...prevSelected, id]
    );
  };
  // Filter the courses based on the selected instructor
  const filteredCourses = fetchedCourses.filter(course =>
    course.instructors.some(instructor => instructor.name === instructors[value].name)
  );

  const isAllSelected = filteredCourses.length > 0 && selectedCourses.length === filteredCourses.length;
  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      const allIds = filteredCourses.map((course) => course.id);
      setSelectedCourses(allIds);
    } else {
      setSelectedCourses([]);
    }
  };

  // Save function to log all the values
  const handleSave = async () => {
    // Create an array of courses in the required format
    const coursesData = fetchedCourses.map((course) => {
      // Assuming `course.id` uniquely identifies the course
      const instructor = course.instructors[0]; // Get the first instructor, assuming there’s at least one instructor
  
      return {
        courseIndex: course.id,  // Use `course.id` as the unique identifier for the course
        course_code: course.course_code,
        course_description: course.course_description,
        curriculum: course.curriculum || "N/A", // Default to "N/A" if curriculum is missing
        schedule: {
          day: instructor?.schedule.day,
          start_time: instructor?.schedule.start_time,
          end_time: instructor?.schedule.end_time,
          room: instructor?.schedule.room,
          section: instructor?.schedule.section,
          total_units: instructor?.schedule.total_units,
        },
      };
    });
  
 
    // Create the object to send to the API
    const logData = {
      courses: coursesData,
      academicYear: academicYear,
      semester: semester,
      instructorName: instructors[value]?.name || "Unknown Instructor", // Get the instructor name for the selected tab
    };
  
    try {
      // Make the API call to update course and instructor data
      const response = await updateCourseAndInstructorName(
        logData.courses,
        logData.academicYear,
        logData.semester,
        logData.instructorName
      );
      console.log("Courses updated successfully:", response);
    } catch (error) {
      console.error("❌ Failed to update courses:", error.message);
    }
  };
  
  const handleDelete = async () => {
    const deletePayload = {
      courseIndices: selectedCourses.map(String),
      academicYear,
      semester,
    };

    console.log("✅ Courses deleted successfully:", deletePayload);
  
    try {
      const response = await deleteMultipleCourses(
        deletePayload.courseIndices,
        deletePayload.academicYear,
        deletePayload.semester
      );
      console.log("✅ Courses deleted successfully:", response);
  
      // Optionally filter out deleted courses from state
      setFetchedCourses((prevCourses) =>
        prevCourses.filter((course) => !deletePayload.courseIndices.includes(String(course.id)))
      );
  
      // Clear selected courses
      setSelectedCourses([]);
    } catch (error) {
      console.error("❌ Failed to delete courses:", error.message);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ color: "#041129", fontSize: { xs: "20px", sm: "24px", md: "30px", lg: "32px" }, fontWeight: "600", mb: -1 }}>
        Edit Schedule
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 50 }}>
        <Typography sx={{ color: "#041129", fontSize: '15px', fontWeight: 500, mb: 1 }}>
          Academic Year: <strong>{academicYear}</strong> | Semester: <strong>{semester}</strong>
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 2,
          height: '35vh',
        }}>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: '90%',
            maxWidth: '2000px',
            borderTop: '3px solid #2083D5',
            bgcolor: '#cce1f4',
            p: 2
          }}>
            <Typography sx={{ color: "#041129", fontSize: '16px', mb: 1, fontWeight: 500, mt: -2 }}>
              <InfoIcon sx={{ color: '#15588E', fontSize: 15, mt: 2 }} /> This action may replace existing data for the following users.
            </Typography>
            <Typography sx={{ color: "#041129", fontSize: '13px', mb: 1, fontWeight: 300 }}>
              <strong>Note:</strong> You are about to apply changes to the selected users. These updates will overwrite any existing data for the affected users.
              <br />
              Please review the list carefully to ensure that the correct users are selected before proceeding.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 4 }}>
            {instructors.map((instructor) => (
              <Chip
                key={instructor.id}
                label={instructor.name}
                onDelete={() => setInstructors(instructors.filter(i => i.id !== instructor.id))}
              />
            ))}
          </Stack>
          <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1,
            mb: 4,
            flexWrap: 'wrap', // Allow items to wrap on smaller screens
            p: 2,
            justifyContent: { xs: 'center', sm: 'flex-start' }, 
          
            width: { xs: '100%', sm: '100%', md:'100%', lg:'90%' },
          }}
        >
         <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: '45px',
              height: '40px',
              maxWidth: 160,
              width: { xs: '100%', sm: '30%', md:'20%' }, // Full width on small screens
              backgroundColor: '#cceaff',
              border: '1px solid #1a4076',
              color: '#1a4076',
              fontWeight: 600,
              boxShadow: 'none',
              mb: { xs: 2, sm: 0 }, 
              ml: { md:2,lg: 3 }, // Add margin bottom on small screens
            }}
          >
            Save
          </Button>

          <Button
  variant="outlined"
  onClick={handleDelete}
  sx={{
    borderRadius: '45px',
    height: '40px',
    maxWidth: 160,
    width: { xs: '100%', sm: '30%', md:'20%' },
    color: '#d32f2f',
    borderColor: '#d32f2f',
    fontWeight: 600,
    boxShadow: 'none',
    ml: { md: 2, lg: 3 }, 
    mt: { xs: 2, sm: 0 },
  }}
  disabled={selectedCourses.length === 0}
>
  Delete Selected
</Button>


        </Box>
 
          <Box sx={{ width: '100%', maxWidth: 1300, mt: 3 }}>
            {/* Instructor Tabs */}
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Instructor Tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {instructors.map((instructor, index) => (
                <Tab key={index} label={instructor.name} />
              ))}
            </Tabs>

            {instructors[value] && filteredCourses.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
        <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAllClick}
            indeterminate={
              selectedCourses.length > 0 && selectedCourses.length < filteredCourses.length
            }
          />
        </TableCell>
        <TableCell>Course Code</TableCell>
        <TableCell>Course Description</TableCell>
        <TableCell>Day</TableCell>
        <TableCell>Start Time</TableCell>
        <TableCell>End Time</TableCell>
        <TableCell>Room</TableCell>
        <TableCell>Section</TableCell>
        <TableCell>Units</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredCourses.map((course) => (
        <TableRow key={course.id}>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedCourses.includes(course.id)}
              onChange={() => handleCheckboxChange(course.id)}
            />
          </TableCell>
          <TableCell>
            <TextField
              value={course.course_code}
              onChange={(e) =>
                handleTextFieldChange(course.id, 'course_code', e.target.value)
              }
              fullWidth
            />
          </TableCell>
          <TableCell>
            <TextField
              value={course.course_description}
              onChange={(e) =>
                handleTextFieldChange(course.id, 'course_description', e.target.value)
              }
              fullWidth
            />
          </TableCell>
          <TableCell>
            <Select
              value={course.instructors[0].schedule.day}
              onChange={(e) => handleTextFieldChange(course.id, 'day', e.target.value)}
              fullWidth
              displayEmpty
            >
              <MenuItem value=""><em>Select Day</em></MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="T">T</MenuItem>
              <MenuItem value="W">W</MenuItem>
              <MenuItem value="TH">TH</MenuItem>
              <MenuItem value="F">F</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="SU">SU</MenuItem>
            </Select>
          </TableCell>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
  <TableCell>
    <TimePicker
      label="Start Time"
      ampm={true}  // This will enable AM/PM
      value={dayjs(course.instructors[0].schedule.start_time, 'HH:mm A')}
      onChange={(newValue) =>
        handleTextFieldChange(course.id, 'start_time', newValue.format('hh:mm A'))  // Save in "hh:mm A" format
      }
      renderInput={(params) => <TextField {...params} fullWidth />}
    />
  </TableCell>
  <TableCell>
    <TimePicker
      label="End Time"
      ampm={true}  // This will enable AM/PM
      value={dayjs(course.instructors[0].schedule.end_time, 'HH:mm A')}
      onChange={(newValue) =>
        handleTextFieldChange(course.id, 'end_time', newValue.format('hh:mm A'))  // Save in "hh:mm A" format
      }
      renderInput={(params) => <TextField {...params} fullWidth />}
    />
  </TableCell>
</LocalizationProvider>
          <TableCell>
            <TextField
              value={course.instructors[0].schedule.room}
              onChange={(e) => handleTextFieldChange(course.id, 'room', e.target.value)}
              fullWidth
            />
          </TableCell>
          <TableCell>
            <TextField
              value={course.instructors[0].schedule.section}
              onChange={(e) => handleTextFieldChange(course.id, 'section', e.target.value)}
              fullWidth
            />
          </TableCell>
          <TableCell>
            <TextField
              type="number"
              value={course.instructors[0].schedule.total_units}
              onChange={(e) => handleTextFieldChange(course.id, 'total_units', e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 1 }}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditInstructors;
