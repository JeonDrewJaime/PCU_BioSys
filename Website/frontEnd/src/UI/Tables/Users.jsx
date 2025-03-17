import React from "react";
import { useEffect, useState} from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Menu,
  Checkbox,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  TableSortLabel,
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
  handleEditUser,
  handleInputChange,
  handleSaveUser,
  handleCancelEdit,
  renderStars,
  getRowStyle,
  handleOpenReportDialog,
  onRowSelectionChange
}) => {

  const [anchorEl, setAnchorEl] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);

const handleMenuOpen = (event, user) => {
  setAnchorEl(event.currentTarget);
  setSelectedUser(user);
};

const handleMenuClose = () => {
  setAnchorEl(null);
  setSelectedUser(null);
};

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
      once: true,
    });
  }, []);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectRow = (userId) => {
    setSelectedRows((prev) => {
      const newSelectedRows = prev.includes(userId)
        ? prev.filter((id) => id !== userId) // Deselect
        : [...prev, userId]; // Select
      
      onRowSelectionChange(newSelectedRows); // Notify the parent
      return newSelectedRows;
    });
  };
  const sortedPeople = [...people].sort((a, b) => {
    const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
    const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
    return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  return (
    <TableContainer component={Paper} sx={{ border: "1px solid #cccccc", boxShadow: "none",  borderLeft: "1px solid #ffffff", borderRight: "1px solid #ffffff",  }}>
    <Table >
      <TableHead sx={{ backgroundColor: "#ffffff" }}>
      <TableRow >
      <TableCell
  sx={{
    fontWeight: 400,
    color: "#041129",
    textAlign: 'center',
    fontSize: "15px",
    minWidth: 145, // Adjust this value to increase the width
    width: 'auto', // Ensures the cell adjusts automatically based on content, but still allows flexibility
  }}
>
  {selectedRows.length > 0 ? `Selected: ${selectedRows.length}` : ""}
</TableCell>


        <TableCell   sx={{
          fontWeight: 600,
          color: "#041129",
          fontSize:"17px",
          
        }}>
                
          <TableSortLabel
          active
          direction={sortOrder}
          onClick={handleSort}
          sx={{
            color: "#041129", 
            "&.MuiTableSortLabel-root": {
              color: "#041129 !important", 
            },
            "& .MuiTableSortLabel-icon": {
              color: "#041129 !important", 
            },
          }}
        >
          {editingRow ? "First Name" : "Name"}
        </TableSortLabel>

        </TableCell>

  {editingRow && <TableCell sx={{ fontWeight: 600,
          color: "#041129",
          fontSize:"17px" }}>Last Name</TableCell>}
  <TableCell sx={{
          fontWeight: 600,
          color: "#041129",
          fontSize:"17px"
        }}>Department</TableCell>
        
  <TableCell sx={{
          fontWeight: 600,
          color: "#041129",
          fontSize:"17px"
        }}>Email</TableCell>

  <TableCell sx={{
          fontWeight: 600,
          color: "#041129",
          fontSize:"17px"
        }}>Role</TableCell>

  <TableCell sx={{
          fontWeight: 600,
          color: "#041129",
          fontSize:"17px"
        }}>Grade</TableCell>

  <TableCell></TableCell>
</TableRow>
      </TableHead>



        <TableBody>
          {sortedPeople.map((person) => (
            <React.Fragment key={person.id}>
              <TableRow data-aos="fade-right" style={getRowStyle(person.attendance)}>
              
              <TableCell padding="checkbox">
              <Checkbox
          checked={selectedRows.includes(person.id)}
          onChange={() => handleSelectRow(person.id)}
        />
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

{editingRow === person.id && (
  <TableCell>
    <TextField
      value={editedData.lastname}
      onChange={(e) => handleInputChange(e, "lastname")}
      fullWidth
    />
  </TableCell>
)}
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
              
                   { person.email}
                  
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
      <IconButton onClick={(e) => handleMenuOpen(e, person)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedUser?.id === person.id}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleEditUser(selectedUser.id); handleMenuClose(); }}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { handleOpenReportDialog(selectedUser); handleMenuClose(); }}>
          View Profile
        </MenuItem>
      </Menu>
    </>
  )}
</TableCell>
              </TableRow>

            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Users;