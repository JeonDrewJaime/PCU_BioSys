import React from "react";
import { useEffect, useState} from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Menu,
  Checkbox,
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
  TextField,
  TableSortLabel,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Edit, Save, Cancel} from "@mui/icons-material";
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
  
      // Log the selected user IDs
      console.log("Selected User IDs:", newSelectedRows);
  
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
      <TableCell padding="checkbox">
 
      <Checkbox
  sx={{  }}
  checked={selectedRows.length === people.length && people.length > 0}
  indeterminate={selectedRows.length > 0 && selectedRows.length < people.length}
  onChange={(e) => {
    const isChecked = e.target.checked;
    const newSelected = isChecked ? people.map((person) => person.id) : [];
    setSelectedRows(newSelected);
    onRowSelectionChange(newSelected);
  }}
/>

<Typography
  variant="body2"
  sx={{
    textAlign: "center",
    fontSize: "10px",
    mb: 0.5,
    fontWeight: 400,
    color: "#041129",
    minWidth: 145,
    width: 'auto',
    ml:-4
  }}
>
  {selectedRows.length > 0
    ? `${selectedRows.length} ${selectedRows.length === 1 ? 'row' : 'rows'} selected`
    : ''}
</Typography>
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
        }}>Actions</TableCell>

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