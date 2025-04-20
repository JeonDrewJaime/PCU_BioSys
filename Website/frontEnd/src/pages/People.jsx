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
const [selectedColor, setSelectedColor] = useState("");
const [selectedUser, setSelectedUser] = useState(null);
const [refresh, setRefresh] = useState(false);

const updatePeople = (newUser) => {
  setPeople(prevPeople => [...prevPeople, newUser]);
};
const handleDepartmentChange = (event) => {
  setSelectedDepartment(event.target.value);
};


const handleDeleteUser = async (userIds) => {
  // Log the user IDs to be deleted
  console.log("User IDs to be deleted:", userIds);

  // Show confirmation modal
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete them!",
  });

  if (result.isConfirmed) {
    try {
      // Call API to delete multiple users from the database
      await adminAPI.delete('/delete', { data: { userIds } });
      // Update UI
      setPeople((prev) => prev.filter((user) => !userIds.includes(user.id)));

      Swal.fire("Deleted!", "Users have been deleted.", "success");
    } catch (error) {
      console.error("❌ Error deleting users:", error);
      Swal.fire("Error!", "Failed to delete users.", "error");
    }
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


const renderStars = (attendanceData, role) => {
  const maxStars = 5;
  if (!attendanceData || role === "Admin") return null; // Skip for admins

  let presentDays = 0, lateDays = 0, absentDays = 0, totalDays = 0;

  // Traverse the nested attendance structure
  Object.values(attendanceData).forEach((academicYear) => {
    Object.values(academicYear).forEach((semester) => {
      Object.entries(semester).forEach(([date, sessions]) => {
        totalDays++;
        const sessionStatuses = Object.values(sessions).map(session => session.late_status?.toLowerCase());
        
        if (sessionStatuses.some(status => status === "on time")) {
          presentDays++;
        } else if (sessionStatuses.some(status => status === "late")) {
          lateDays++;
        } else {
          absentDays++;
        }
      });
    });
  });

  const attendanceScore = totalDays > 0 ? (presentDays + (lateDays * 0.5)) / totalDays : 0;
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

const getStarCount = (attendanceData, role) => {
  const maxStars = 5;
  if (!attendanceData || role === "Admin") return 0; // Return 0 stars for admins

  let presentDays = 0, lateDays = 0, absentDays = 0, totalDays = 0;

  Object.values(attendanceData).forEach((academicYear) => {
    Object.values(academicYear).forEach((semester) => {
      Object.entries(semester).forEach(([date, sessions]) => {
        totalDays++;
        const sessionStatuses = Object.values(sessions).map(session => session.late_status?.toLowerCase());
        
        if (sessionStatuses.some(status => status === "on time")) {
          presentDays++;
        } else if (sessionStatuses.some(status => status === "late")) {
          lateDays++;
        } else {
          absentDays++;
        }
      });
    });
  });

  const attendanceScore = totalDays > 0 ? (presentDays + (lateDays * 0.5)) / totalDays : 0;
  return Math.min(maxStars, Math.round(attendanceScore * maxStars));
};

const getRowStyle = (attendanceData, role) => {
  if (role === "Admin") return "#F5B7B1"; // No background color for admins
  
  const stars = getStarCount(attendanceData, role);

  switch (stars) {
    case 5: return { backgroundColor: "#A1BAAA4D" }; // Excellent (LIGHT GREEN)
    case 4: return { backgroundColor: "#A7B8DD4D" }; // Very Good (LIGHT BLUE)
    case 3: return { backgroundColor: "#FEEAAE4D" }; // LIGHT YELLOW 
    case 2: return { backgroundColor: "#ECC0D54D" }; // Satisfactory (LIGHT PINK)
    case 1: return { backgroundColor: "#D6A09A4D" }; // Needs Improvement (LIGHT RED)
    case 0: return { backgroundColor: "#9F4B414D" }; // DARK RED
    
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
      setRefresh(prev => !prev); // Toggle refresh state to force re-render
    } catch (error) {
      console.error("❌ Error updating user:", error);
      Swal.fire("Error!", "Failed to update user.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
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
          color: '#0F232F',
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
        <DialogTitle sx={{ color: "black", mb:3 }}>
          
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
        <CreateUser 
  onClose={() => {
    setOpenDialog(false);
    setRefresh(prev => !prev); // Trigger refresh
  }}
  updatePeople={updatePeople}
/>
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
