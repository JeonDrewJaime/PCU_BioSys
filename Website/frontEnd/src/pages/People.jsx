import React, { useState, useEffect } from "react";
import adminAPI from "../../APIs/adminAPI";
import { database, ref, get } from "../../utils/firebase-config";
import { getAuth, deleteUser as deleteAuthUser } from "firebase/auth";
import CloseIcon from '@mui/icons-material/Close';
import AOS from 'aos';
import 'aos/dist/aos.css';


import UserReportDialog from "../UI/Dialogs/UserDialog";
import { Star, StarBorder } from "@mui/icons-material";
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
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration (in ms)
      offset: 100,    // Offset (in px) before animation triggers
      once: true,     // Whether animation should happen only once
    });
  }, []);
  
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
const [currentUser, setCurrentUser] = useState(null);



const handleColorChange = (event) => {
  setSelectedColor(event.target.value);
};

const handleOpenReportDialog = async (user) => {
  setSelectedUser(user);

  const attendanceRef = ref(database, `users/faculty/${user.id}/attendance`);
  try {
    const snapshot = await get(attendanceRef);
    const attendanceData = snapshot.exists() ? snapshot.val() : {};
    const sortedDates = Object.keys(attendanceData).sort((a, b) => new Date(b) - new Date(a));
    setSelectedUser((prev) => ({
      ...prev,
      attendance: attendanceData, // Attach attendance data to selected user
    }));
    setReportDialogOpen(true);
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
  }
};

const validatedCount = async () => {
  let count = 0;

  const snapshot = await get(attendanceRef);

  if (snapshot.exists()) {
    const attendanceData = snapshot.val();

    // Loop through each date (like 2025-03-05)
    for (const date in attendanceData) {
      const subjects = attendanceData[date];

      // Loop through each subject (like "ITEC1201 - COMPUTER PROGRAMMING 2 LAB")
      for (const subject in subjects) {
        const record = subjects[subject];

        // Check main status
        if (record.status === "Validated") {
          count++;
        }

        // Check all validate_x.status fields
        for (let i = 1; i <= 3; i++) {
          if (record[`validate_${i}`]?.status === "Validated") {
            count++;
          }
        }
      }
    }
  }

  return count;
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
  
  const calculateTotalHours = (attendanceData) => {
    return Object.values(attendanceData || {}).reduce((total, details) => {
      return total + (parseFloat(details.total_hours) || 0);
    }, 0).toFixed(2);
  };
  
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
      [`${personId}-${date}`]: prev[`${personId}-${date}`] ? null : { loading: true, data: null },
    }));
  
    if (!expandedDates[`${personId}-${date}`]) {
      const attendanceDetailRef = ref(database, `users/faculty/${personId}/attendance/${date}`);
      try {
        const snapshot = await get(attendanceDetailRef);
        const attendanceData = snapshot.exists() ? snapshot.val() : {};
       
  
        setExpandedDates((prev) => ({
          ...prev,
          [`${personId}-${date}`]: { loading: false, data: attendanceData },
        }));
      } catch (error) {
        console.error("❌ Error fetching attendance details:", error);
      }
    }
  };

  const getValidatedCount = (details) => {
    let count = 0;
  
    for (let i = 1; i <= 3; i++) {
      if (details[`validate_${i}`]?.status === "Validated") {
        count++;
      }
    }
  
    const percentage = Math.round((count / 3) * 100); // Rounded percentage
  
    const getColor = () => {
      if (percentage === 100) return "success";
      if (percentage >= 50) return "warning";
      return "error";
    };
  
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={percentage}
          color={getColor()}
          size={50}
          thickness={5}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" fontWeight="bold">
            {percentage}%
          </Typography>
        </Box>
      </Box>
    );
  };
  
  
  return (
    <>
     
   <Typography variant="h4" gutterBottom sx = {{color: "#041129", fontWeight: "bold"}}>
        People
      </Typography>
      <Typography gutterBottom sx = {{color: "#041129",mt: -1, mb: 2,fontSize: "16px"}}>
     Here’s a snapshot of your employees' recent performance metrics and important updates. Stay on top of your team’s progress.
      </Typography>
    <Paper sx={{ padding: 2, border: "1px solid #D6D7D6", boxShadow: "none", }}  data-aos="fade-up" >
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
                  Add People
                </Button>
      </Box>
      <TableContainer component={Paper} sx={{border: "1px solid #D6D7D6", boxShadow: "none", }}>
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
          <TableBody >
            {filteredPeople.map((person) => (
              <React.Fragment key={person.id}>
                <TableRow 
                 data-aos="fade-right" 
  style={getRowStyle(person.attendance)}>
                  <TableCell>
                  <Tooltip title = "View Attendance">
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
                </TableRow >
                {expandedRows[person.id] && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      
                      <Collapse in timeout="auto" unmountOnExit>
                      <Box>
  <strong>Attendance Dates:</strong>
  {Object.keys(expandedRows[person.id].data || {})
    .sort((a, b) => new Date(b) - new Date(a)) // Sort dates in descending order
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
