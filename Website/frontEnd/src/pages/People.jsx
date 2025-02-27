import React, { useState, useEffect } from "react";
import adminAPI from "../../APIs/adminAPI";
import { database, ref, get } from "../../utils/firebase-config";
import { getAuth, deleteUser as deleteAuthUser } from "firebase/auth";
import CloseIcon from '@mui/icons-material/Close';

import UserReportDialog from "../UI/Dialogs/UserDialog";
import { Star, StarBorder } from "@mui/icons-material";
import {
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
  Chip,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,

} from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Edit, Save, Cancel, Search, Close } from "@mui/icons-material";
import Swal from "sweetalert2";
import CreateUser from "../UI/Dialogs/CreateUser";
import SummarizeIcon from '@mui/icons-material/Summarize';

function People() {
  const [people, setPeople] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRole, setSelectedRole] = useState(""); // New state for role filtering
  const [expandedDates, setExpandedDates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
   const [openDialog, setOpenDialog] = useState(false);
   const [reportDialogOpen, setReportDialogOpen] = useState(false);
const [selectedUserId, setSelectedUserId] = useState(null);
const [selectedColor, setSelectedColor] = useState("");
const [selectedUser, setSelectedUser] = useState(null);


const handleColorChange = (event) => {
  setSelectedColor(event.target.value);
};

const handleOpenReportDialog = async (user) => {
  setSelectedUser(user);

  const attendanceRef = ref(database, `users/faculty/${user.id}/attendance`);
  try {
    const snapshot = await get(attendanceRef);
    const attendanceData = snapshot.exists() ? snapshot.val() : {};

    setSelectedUser((prev) => ({
      ...prev,
      attendance: attendanceData, // Attach attendance data to selected user
    }));
    setReportDialogOpen(true);
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
  }
};

const renderStars = (attendanceData) => {
  const maxStars = 5;
  if (!attendanceData) return null;

  let presentDays = 0, lateDays = 0, absentDays = 0, totalDays = Object.keys(attendanceData).length;

  Object.values(attendanceData).forEach((sessions) => {
    if (Object.values(sessions).some((session) => session.late_status?.toLowerCase() === "on time")) {
      presentDays++;
    } else if (Object.values(sessions).some((session) => session.late_status?.toLowerCase() === "late")) {
      lateDays++;
    } else {
      absentDays++;
    }
  });

  // Score calculation: More weight on absences affecting stars
  const attendanceScore = (presentDays + (lateDays * 0.5)) / totalDays;
  const filledStars = Math.min(maxStars, Math.round(attendanceScore * maxStars));

  return (
    <>
      {[...Array(maxStars)].map((_, index) =>
        index < filledStars ? (
          <Star key={index} sx={{ color: "black" }} />
        ) : (
          <StarBorder key={index} sx={{ color: "black" }} />
        )
      )}
    </>
  );
};


const getStarCount = (attendanceData) => {
  const maxStars = 5;
  if (!attendanceData) return 0;

  let presentDays = 0, lateDays = 0, absentDays = 0, totalDays = Object.keys(attendanceData).length;

  Object.values(attendanceData).forEach((sessions) => {
    if (Object.values(sessions).some((session) => session.late_status?.toLowerCase() === "on time")) {
      presentDays++;
    } else if (Object.values(sessions).some((session) => session.late_status?.toLowerCase() === "late")) {
      lateDays++;
    } else {
      absentDays++;
    }
  });

  const attendanceScore = (presentDays + (lateDays * 0.5)) / totalDays;
  return Math.min(maxStars, Math.round(attendanceScore * maxStars));
};

const getRowStyle = (attendanceData) => {
  const stars = getStarCount(attendanceData);

  switch (stars) {
    case 5: return { backgroundColor: "#D4EDDA" }; // Excellent (Light Green)
    case 4: return { backgroundColor: "#D1ECF1" }; // Very Good (Light Blue)
    case 3: return { backgroundColor: "#FFF3CD" }; // Good (Light Yellow)
    case 2: return { backgroundColor: "#F8D7DA" }; // Satisfactory (Light Pink)
    case 1: return { backgroundColor: "#FADBD8" }; // Needs Improvement (Light Red)
    case 0: return { backgroundColor: "#F5B7B1" }; // Unsatisfactory (Darker Red)
    default: return {};
  }
};

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredPeople = people.filter(
    (person) => {
      const rowColor = getRowStyle(person.attendance).backgroundColor;
      return (
        [person.firstname, person.lastname, person.email, person.department, person.role].some(
          (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
        ) &&
        (selectedRole === "" || person.role === selectedRole) &&
        (selectedColor === "" || rowColor === selectedColor) // Compare row color
      );
    }
  );
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAPI.get("/users");
        const users = response.data?.data || [];
  
        // Fetch attendance for each user
        const updatedUsers = await Promise.all(
          users.map(async (user) => {
            const attendanceRef = ref(database, `users/faculty/${user.id}/attendance`);
            try {
              const snapshot = await get(attendanceRef);
              const attendanceData = snapshot.exists() ? snapshot.val() : {};
              return { ...user, attendance: attendanceData };
            } catch (error) {
              console.error(`❌ Error fetching attendance for ${user.id}:`, error);
              return { ...user, attendance: {} };
            }
          })
        );
  
        setPeople(updatedUsers);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    };
  
    fetchData();
  }, []);
  
  const handleEditUser = (userId) => {
    if (editingRow === userId) {
      setEditingRow(null);
    } else {
      setEditingRow(userId);
      const user = people.find((p) => p.id === userId);
      setEditedData({ ...user });
    }
  };

  const handleInputChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const handleSaveUser = async (userId) => {
    try {
      await adminAPI.put(`/edit/${userId}`, editedData);
      setPeople((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, ...editedData } : user))
      );
      setEditingRow(null);
      Swal.fire("Success!", "User details updated successfully.", "success");
    } catch (error) {
      console.error("❌ Error updating user:", error);
      Swal.fire("Error!", "Failed to update user.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };
  const getStatusChip = (status) => {
    let color = "default";

    switch (status?.toLowerCase()) {
      case "on time":
        color = "success";
        break;
      case "late":
        color = "warning";
        break;
      case "absent":
        color = "error";
        break;
      default:
        color = "default";
    }

    return <Chip label={status} color={color} variant="outlined" />;
  };
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (result.isConfirmed) {
      try {
        // Call API to delete user from database
        await adminAPI.delete(`/delete/${userId}`);
    
        Swal.fire("Deleted!", "User has been deleted.", "success");
  
        // Remove from Firebase Authentication (only works if deleting current logged-in user)
        const auth = getAuth();
        if (auth.currentUser && auth.currentUser.uid === userId) {
          await deleteAuthUser(auth.currentUser);
        }
  
        // Update UI
        setPeople((prev) => prev.filter((user) => user.id !== userId));
  
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        Swal.fire("Error!", "Failed to delete user.", "error");
      }
    }
  };

  const toggleRow = async (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: prev[id] ? null : { loading: true, data: null },
    }));

    if (!expandedRows[id]) {
      const attendanceRef = ref(database, `users/faculty/${id}/attendance`);
      try {
        const snapshot = await get(attendanceRef);
        const attendanceData = snapshot.exists() ? snapshot.val() : {};
        setExpandedRows((prev) => ({
          ...prev,
          [id]: { loading: false, data: attendanceData },
        }));
      } catch (error) {
        console.error("❌ Error fetching attendance:", error);
      }
    }
  };

  const toggleDate = async (personId, date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [`${personId}-${date}`]: prev[`${personId}-${date}`] ? null : { loading: true, data: null, totalHours: 0 },
    }));
  
    if (!expandedDates[`${personId}-${date}`]) {
      const attendanceDetailRef = ref(database, `users/faculty/${personId}/attendance/${date}`);
      try {
        const snapshot = await get(attendanceDetailRef);
        const attendanceData = snapshot.exists() ? snapshot.val() : {};
        const totalHours = Object.values(attendanceData).reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  
        setExpandedDates((prev) => ({
          ...prev,
          [`${personId}-${date}`]: { loading: false, data: attendanceData, totalHours },
        }));
      } catch (error) {
        console.error("❌ Error fetching attendance details:", error);
      }
    }
  };

  return (
    <>
    <Paper sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Search sx={{ mr: 1 }} />
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
        />
                  <FormControl sx={{ minWidth: 150, mx: 2 }} size="small">
            <InputLabel>Role</InputLabel>
            <Select value={selectedRole} onChange={handleRoleChange}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Faculty">Faculty</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150, mx: 2 }} size="small">
  <InputLabel>Rating</InputLabel>
  <Select value={selectedColor} onChange={handleColorChange}>
    <MenuItem value="">All</MenuItem>
    <MenuItem value="#D4EDDA">Excellent</MenuItem>
    <MenuItem value="#D1ECF1">Very Good</MenuItem>
    <MenuItem value="#FFF3CD">Good</MenuItem>
    <MenuItem value="#F8D7DA">Satisfactory</MenuItem>
    <MenuItem value="#FADBD8">Needs Improvement</MenuItem>
    <MenuItem value="#F5B7B1">Unsatisfactory</MenuItem>
  </Select>
</FormControl>

         <Button
                  variant="contained"
                  onClick={() => setOpenDialog(true)}
                  sx={{
                    mx: 1,
                    borderRadius: '45px',
                    height: '40px',
                    width: '200px',
                    backgroundColor: '#E4E4F1',
                    borderColor: '#012763',
                    color: '#012763',
                    fontWeight: 600,
                  }}
                >
                  Add People
                </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {filteredPeople.map((person) => (
              <React.Fragment key={person.id}>
                <TableRow 
  style={getRowStyle(person.attendance)}>
                  <TableCell>
                    <IconButton onClick={() => toggleRow(person.id)}>
                      {expandedRows[person.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {editingRow === person.id ? (
                      <TextField
                        value={editedData.firstname}
                        onChange={(e) => handleInputChange(e, "firstname")}
                        fullWidth
                      />
                    ) : (
                      `${person.firstname} ${person.lastname}`
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
        <MenuItem value="Mathematics">Mathematics</MenuItem>
        <MenuItem value="Physics">Physics</MenuItem>
        <MenuItem value="Engineering">Engineering</MenuItem>
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
<TableCell>
  {renderStars(person.attendance)}
</TableCell>

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
                        <IconButton onClick={() => handleEditUser(person.id)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(person.id)} color="error">
                          <Delete />
                        </IconButton>
                        <IconButton onClick={() => handleOpenReportDialog(person)} color="info">
  <SummarizeIcon />
</IconButton>

                      </>
                    )}
                  </TableCell>
                </TableRow >
                {expandedRows[person.id] && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Collapse in timeout="auto" unmountOnExit>
                        <Box>
                          <strong>Attendance Dates:</strong>
                          {Object.keys(expandedRows[person.id].data || {}).map((date) => (
                            <Box key={date}>
                              <IconButton onClick={() => toggleDate(person.id, date)}>
                                {expandedDates[`${person.id}-${date}`] ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                              {date}
                              <Collapse in={!!expandedDates[`${person.id}-${date}`]} timeout="auto" unmountOnExit>
                                <Box sx={{ marginLeft: 4 }}>
                                  <TableContainer component={Paper}>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Course</TableCell>
                                          <TableCell>Time In</TableCell>
                                          <TableCell>Time Out</TableCell>
                                          <TableCell>Status</TableCell>
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
                                                <TableCell>{details.total_hours}</TableCell>
                                              </TableRow>
                                            )
                                          )}
<TableRow>
    <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
      Total Hours:
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
      {expandedDates[`${person.id}-${date}`]?.totalHours || 0}
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
    </Paper>

    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
  <DialogTitle sx = {{color: "black"}}>
    Add People
    <IconButton
      aria-label="close"
      onClick={() => setOpenDialog(false)}
      sx={{ position: 'absolute', right: 8, top: 8 }}
    >
      <Close />
    </IconButton>
  </DialogTitle>
  <DialogContent>
  <CreateUser/>
  </DialogContent>
</Dialog>

    <UserReportDialog
  open={reportDialogOpen}
  onClose={() => setReportDialogOpen(false)}
  user={selectedUser}
/>
    </>
  );
}

export default People;
