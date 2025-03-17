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
  Typography,
  Paper,
  IconButton,
  Box,
  TextField,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Checkbox,
  InputAdornment

} from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Edit, Save, Cancel, Search, Close } from "@mui/icons-material";
import Swal from "sweetalert2";
import CreateUser from "../UI/Dialogs/CreateUser";
import SummarizeIcon from '@mui/icons-material/Summarize';
import Users from "../UI/Tables/Users";

function People() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration (in ms)
      offset: 100,    // Offset (in px) before animation triggers
      once: true,     // Whether animation should happen only once
    });
  }, []);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
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


const handleDepartmentChange = (event) => {
  setSelectedDepartment(event.target.value);
};

const handleSelectAllRows = () => {
  const newSelectAll = !selectAll;
  setSelectAll(newSelectAll);
  
  if (newSelectAll) {
    setSelectedRows(filteredPeople.map(person => person.id)); // Select all users
  } else {
    setSelectedRows([]); // Deselect all
  }
};

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
        (selectedDepartment === "" || person.department === selectedDepartment) &&
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


  const handleDeleteSelectedUsers = async () => {
    if (selectedRows.length === 0) return;
  
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedRows.length} user(s). This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });
  
    if (result.isConfirmed) {
      try {
        // Delete users one by one
        for (const userId of selectedRows) {
          await adminAPI.delete(`/delete/${userId}`);
          const auth = getAuth();
          if (auth.currentUser && auth.currentUser.uid === userId) {
            await deleteAuthUser(auth.currentUser);
          }
        }
  
        // Update UI after deletion
        setPeople((prev) => prev.filter((user) => !selectedRows.includes(user.id)));
        setSelectedRows([]); // Clear selection
  
        Swal.fire("Deleted!", "Selected users have been removed.", "success");
      } catch (error) {
        console.error("❌ Error deleting users:", error);
        Swal.fire("Error!", "Failed to delete selected users.", "error");
      }
    }
  };
  
  const handleRowSelection = (selectedIds) => {
    setSelectedRows(selectedIds);
  };
  return (
    <>
     
     <Typography variant="h4" gutterBottom sx={{ color: "#041129", fontWeight: "bold" }}>
        People
      </Typography>
      <Typography gutterBottom sx={{ color: "#041129", mt: -1, mb: 2, fontSize: "16px" }}>
        Here’s a snapshot of your employees' recent performance metrics and important updates. Stay on top of your team’s progress.
      </Typography>

      <Paper sx={{ padding: 2, border: "1px solid #D6D7D6", boxShadow: "none" }} data-aos="fade-up">
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1,mb: 4, flexWrap: 'wrap' }}>
      {/* Select All Section */}
      <Box
        sx={{
          border: '1px solid #cccccc',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          minWidth: 137,
          borderRadius: '4px',
          height: '40px',
          mr: 1,
        }}
      >
       <Checkbox
        checked={selectAll}
        onChange={handleSelectAllRows}
        inputProps={{ 'aria-label': 'select all users' }}
      />
      <Typography variant="body1" sx={{ fontSize: '15px' }}>
        {selectAll ? 'Select None' : 'Select All'}
      </Typography>
      </Box>

      {/* Department Select */}
      <FormControl sx={{ minWidth: 150, mx: 2, mr: -1, }} size="small">
        <InputLabel>Department</InputLabel>
        <Select value={selectedDepartment} onChange={handleDepartmentChange}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Computer Science">Computer Science</MenuItem>
          <MenuItem value="Information Technology">Information Technology</MenuItem>
          <MenuItem value="Computer Engineering">Computer Engineering</MenuItem>
        </Select>
      </FormControl>

      {/* Role Select */}
      <FormControl sx={{ minWidth: 150, mx: 2, mr: -1, }} size="small">
        <InputLabel>Role</InputLabel>
        <Select value={selectedRole} onChange={handleRoleChange}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Faculty">Faculty</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </Select>
      </FormControl>

      {/* Rating Select */}
      <FormControl sx={{ minWidth: 150, mx: 2, mr: -1, }} size="small">
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

      {/* Actions Select */}
      <FormControl sx={{ minWidth: 150, mx: 2, mr: 1, }} size="small">
        <InputLabel>Actions</InputLabel>
        <Select
          value=""
          displayEmpty
          onChange={(event) => {
            if (event.target.value === 'delete') {
              handleDeleteUser(selectedRows);
            }
          }}
        >
          <MenuItem value=""></MenuItem>
          <MenuItem value="delete" disabled={selectedRows.length === 0}>
            <Delete sx={{ marginRight: 1,}} />
            Delete 
          </MenuItem>
        </Select>
      </FormControl>

      {/* Search Field */}
      <TextField
        variant="outlined"
        placeholder="Search users..."
        value={searchQuery}
        onChange={handleSearchChange}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 430, mx: 2, borderRadius: '4px' }}
      />

      {/* Add User Button */}
      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{
          borderRadius: '45px',
          height: '40px',
          width: '200px',
          backgroundColor: '#cceaff',
          border: '1px solid #1a4076',
          color: '#1a4076',
          fontWeight: 600,
          boxShadow: 'none',
          marginLeft: 'auto', // Align the button to the far right
        }}
      >
        Add User
      </Button>
    </Box>
        <Users
          people={filteredPeople}
          editingRow={editingRow}
          editedData={editedData}
          expandedRows={expandedRows}
          expandedDates={expandedDates}
          searchQuery={searchQuery}
          selectedRole={selectedRole}
          selectedColor={selectedColor}
          handleEditUser={handleEditUser}
          handleInputChange={handleInputChange}
          handleSaveUser={handleSaveUser}
          handleCancelEdit={handleCancelEdit}
          handleDeleteUser={handleDeleteUser}
          toggleRow={toggleRow}
          toggleDate={toggleDate}
          renderStars={renderStars}
          getRowStyle={getRowStyle}
          handleOpenReportDialog={handleOpenReportDialog}
          onRowSelectionChange={handleRowSelection} 
          selectAll={selectAll} 
          selectedRows={selectedRows} 
          setSelectedRows={setSelectedRows} 
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: "black" }}>
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
          <CreateUser />
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
