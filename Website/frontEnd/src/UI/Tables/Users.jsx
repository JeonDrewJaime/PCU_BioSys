import React from "react";
import { useEffect } from "react";
import {
  Chip,
  Typography,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  TextField,
  CircularProgress,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Edit, Save, Cancel} from "@mui/icons-material";
import SummarizeIcon from '@mui/icons-material/Summarize';
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";

const Users = ({
  people,
  editingRow,
  editedData,
  expandedRows,
  expandedDates,
  searchQuery,
  selectedRole,
  selectedColor,
  handleEditUser,
  handleInputChange,
  handleSaveUser,
  handleCancelEdit,
  handleDeleteUser,
  toggleRow,
  toggleDate,
  getStatusChip,
  getValidatedCount,
  calculateTotalHours,
  renderStars,
  getRowStyle,
  handleOpenReportDialog,
}) => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
      once: true,
    });
  }, []);

  return (
    <TableContainer component={Paper} sx={{ border: "1px solid #D6D7D6", boxShadow: "none" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {people.map((person) => (
            <React.Fragment key={person.id}>
              <TableRow data-aos="fade-right" style={getRowStyle(person.attendance)}>
                <TableCell>
                  <Tooltip title="View Attendance">
                    <IconButton onClick={() => toggleRow(person.id)}>
                      {expandedRows[person.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {editingRow === person.id ? (
                    <TextField
                      value={editedData.firstname}
                      onChange={(e) => handleInputChange(e, "firstname")}
                      fullWidth
                    />
                  ) : (
                    person.firstname
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === person.id ? (
                    <TextField
                      value={editedData.lastname}
                      onChange={(e) => handleInputChange(e, "lastname")}
                      fullWidth
                    />
                  ) : (
                    person.lastname
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === person.id ? (
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={editedData.department}
                        onChange={(e) => handleInputChange(e, "department")}
                      >
                        <MenuItem value="Computer Science">Computer Science</MenuItem>
                        <MenuItem value="Information Technology">Information Technology</MenuItem>
                        <MenuItem value="Computer Engineering">Computer Engineering</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    person.department
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === person.id ? (
                    <TextField
                      value={editedData.email}
                      onChange={(e) => handleInputChange(e, "email")}
                      fullWidth
                    />
                  ) : (
                    person.email
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === person.id ? (
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={editedData.role}
                        onChange={(e) => handleInputChange(e, "role")}
                      >
                        <MenuItem value="Faculty">Faculty</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    person.role
                  )}
                </TableCell>
                <TableCell>{renderStars(person.attendance)}</TableCell>
                <TableCell>
                  {editingRow === person.id ? (
                    <>
                      <IconButton onClick={() => handleSaveUser(person.id)} color="success">
                        <Save />
                      </IconButton>
                      <IconButton onClick={handleCancelEdit} color="warning">
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditUser(person.id)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteUser(person.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Report">
                        <IconButton onClick={() => handleOpenReportDialog(person)} color="info">
                          <SummarizeIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
              {expandedRows[person.id] && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Collapse in timeout="auto" unmountOnExit>
                      <Box>
                        <strong>Attendance Dates:</strong>
                        {Object.keys(expandedRows[person.id].data || {})
                          .sort((a, b) => new Date(b) - new Date(a))
                          .map((date) => (
                            <Box key={date}>
                              <Tooltip title="View Record">
                                <IconButton onClick={() => toggleDate(person.id, date)}>
                                  {expandedDates[`${person.id}-${date}`] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </Tooltip>
                              {date}
                              <Collapse in={!!expandedDates[`${person.id}-${date}`]} timeout="auto" unmountOnExit>
                                <Box sx={{ marginLeft: 4 }}>
                                  <TableContainer component={Paper} data-aos="fade-up">
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Course</TableCell>
                                          <TableCell>Time In</TableCell>
                                          <TableCell>Time Out</TableCell>
                                          <TableCell>Status</TableCell>
                                          <TableCell>Verification</TableCell>
                                          <TableCell>Hours</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {expandedDates[`${person.id}-${date}`]?.data &&
                                          Object.entries(expandedDates[`${person.id}-${date}`].data).map(
                                            ([course, details]) => (
                                              <TableRow key={course}>
                                                <TableCell>{course}</TableCell>
                                                <TableCell>{details.time_in}</TableCell>
                                                <TableCell>{details.time_out}</TableCell>
                                                <TableCell>{getStatusChip(details.late_status)}</TableCell>
                                                <TableCell>{getValidatedCount(details)}</TableCell>
                                                <TableCell>{details.total_hours}</TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        <TableRow>
                                          <TableCell colSpan={5} align="right" sx={{ fontWeight: "bold" }}>
                                            Total Hours:
                                          </TableCell>
                                          <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                                            {calculateTotalHours(expandedDates[`${person.id}-${date}`]?.data)}
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              </Collapse>
                            </Box>
                          ))}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Users;