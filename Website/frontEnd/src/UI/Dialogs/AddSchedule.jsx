import React, { useState, useCallback, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, CircularProgress,
  Snackbar, Alert, InputLabel, FormControl, Select, MenuItem } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { styled } from '@mui/system';
import { useDropzone } from 'react-dropzone';
import { format, parse } from 'date-fns';
import { saveExcelData} from '../../../APIs/adminAPI';
import folder from '../../assets/folder.png';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAllUsers } from '../../../APIs/adminAPI';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CreateUser from './CreateUser';
import ValidationAlert from '../ValidationAlert';
import msexcel from '../../assets/msExcel.png'

const handleCloseSnackbar = () => {
  setOpenSnackbar(false);
};
const Container = styled('div')(({ theme }) => ({
  padding: '20px',
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxWidth: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
}));

const DropZoneContainer = styled('div')(({ theme }) => ({
  border: '2px dashed #1976d2',
  borderRadius: '10px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: '#f9f9f9',
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
}));

function AddSchedule( { onClose }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [openDialog, setOpenDialog] = useState(true); // Open dialog immediately
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false)
const [selectedRowIndex, setSelectedRowIndex] = useState(null); // Track which row is being assigned


  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [])

  useEffect(() => {
    if (rows.length > 3) {
      console.log("Contents of 10th column from 4th row onwards:");
      rows.slice(3).forEach((row, index) => {
        console.log(`Row ${index + 4}:`, row[9]); // Index + 4 to match human-readable row count
      });
    }
  }, [rows]);
  
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
  
    if (!file) return;
  
    // Explicit check for file extension
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
    if (!validExtensions.includes(fileExtension)) {
      setSnackbarMessage('Invalid file type. Please upload an Excel file (.xlsx, .xls).');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;  // Stop processing
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      setLoading(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      setTimeout(() => {
        if (jsonData.length > 0) {
          const formattedData = jsonData.map(row => 
            row.map((cell, index) => {
              if (!cell) return "";
              if (columns[index]?.toLowerCase().includes('time')) {
                try {
                  return format(parse(cell, 'hh:mm a', new Date()), 'HH:mm');
                } catch {
                  return cell;
                }
              }
              return cell;
            })
          );
  
          setColumns(jsonData[0]);
          setRows(formattedData);
          setOpenDialog(false);
        }
        setLoading(false);
      }, 1500);
    };
    reader.readAsArrayBuffer(file);
  }, [columns]);
  

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'application/vnd.ms-excel': [] } });


  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleEditRow = (index) => {
    setEditingRow(index);
  };

  const handleSaveRow = () => {
    setEditingRow(null);
  };

  const handleChangeCell = (rowIndex, cellIndex, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][cellIndex] = value;
    setRows(updatedRows);
  };
  const isValidColumn = () => {
    if (rows.length < 2) return false;

    // Expected Headers
    const expectedHeaders = [
        "SECTION", "CURRICULUM", "COURSE CODE", "COURSE DESCRIPTION", "TOTAL UNITS",
        "DAY", "STIME", "ETIME", "ROOM", "INSTRUCTOR"
    ];

    // Validate Headers
    const headersMatch = expectedHeaders.every((header, index) => 
        rows[0][index]?.toString().trim().toLowerCase() === header.toLowerCase()
    );

    if (!headersMatch) return false;

    const numberPattern = /^\d+$/; // Matches numbers only
    const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/; // Matches HH:mm AM/PM
    const allowedDays = ["M", "T", "W", "TH", "F", "S"]; // Allowed day values
    const specialCharPattern = /^[a-zA-Z0-9\s]+$/; // No special characters allowed (only letters, numbers, spaces)

    // Validate 5th column (TOTAL UNITS - index 4) - Must contain only numbers
    const isTotalUnitsValid = rows.slice(1).every(row =>
        numberPattern.test(row[4]?.toString().trim())
    );

    // Validate assigned users in column 10 (INSTRUCTOR - index 9)
    const instructorSet = new Set(users.map(user => `${user.firstname} ${user.lastname}`));
    const isAllUsersValid = rows.slice(1).every(row =>
        instructorSet.has(row[9])
    );

    // Validate 6th column (DAY - index 5) - Must be a valid day
    const isDayColumnValid = rows.slice(1).every(row =>
        allowedDays.includes(row[5]?.toString().trim().toUpperCase())
    );

    // Validate STIME (7th column - index 6) and ETIME (8th column - index 7)
    const isSTIMEValid = rows.slice(1).every(row =>
        timePattern.test(row[6]?.toString().trim())
    );
    const isETIMEValid = rows.slice(1).every(row =>
        timePattern.test(row[7]?.toString().trim())
    );

    // Ensure STIME is before ETIME
    const isTimeOrderValid = rows.slice(1).every(row => {
        const startTime = row[6]?.toString().trim();
        const endTime = row[7]?.toString().trim();

        if (!startTime || !endTime || !timePattern.test(startTime) || !timePattern.test(endTime)) {
            return false; // Invalid format already caught
        }

        const parseTime = timeStr => {
            const [time, modifier] = timeStr.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (modifier === "PM" && hours !== 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;
            return new Date(1970, 0, 1, hours, minutes);
        };

        return parseTime(startTime) < parseTime(endTime); // STIME must be before ETIME
    });

    // Validate Columns 1,2,3,8 (No Special Characters) - SECTION, Curri, COURSE CODE, ROOM
    const isSpecialCharValid = rows.slice(1).every(row =>
        [row[0], row[1], row[2], row[8]].every(value =>
            specialCharPattern.test(value?.toString().trim())
        )
    );

    return (
        headersMatch &&
        isTotalUnitsValid &&
        isAllUsersValid &&
        isDayColumnValid &&
        isSTIMEValid &&
        isETIMEValid &&
        isTimeOrderValid &&
        isSpecialCharValid
    );
};

  const handleSaveToDatabase = () => {

    setLoading(true);
    saveExcelData(columns, rows)
      .then(() => {
        setSnackbarMessage('Content saved to the database successfully.');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      })
      .catch(() => {
        setSnackbarMessage('There was an issue saving to the database.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  

  const filteredRows = rows.filter(row => 
    row.some(cell => cell.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  {rows.length > 0 && (
    <Box sx={{ marginBottom: 2, }}>
      <Alert
        severity={isValidColumn() ? "success" : "error"}
        sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" ,  backgroundColor: "transparent", }}
      >
        <Typography fontWeight={600}>Validation Results:</Typography>
  
        {(() => {
          const yearPattern = /^\d{4}-\d{4}$/; // Declare it here
          const validSemesters = ["1st Sem", "2nd Sem"];
          
          return (
            <>
              {/* ✅ Academic Year Validation */}
              {yearPattern.test(rows[0][0]) && validSemesters.includes(rows[1][0]) ? (
                <Typography sx={{ color: "green" }}>✔️ Academic Year & Semester format is valid</Typography>
              ) : (
                <Typography sx={{ color: "red" }}>❌ Invalid Academic Year or Semester format (Expected: YYYY-YYYY & "1st Sem"/"2nd Sem")</Typography>
              )}
            </>
          );
        })()}
      </Alert>
    </Box>
  )}
  
  
  return (
    <Container sx={{bgcolor:"#f5f5fb"}}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, }}>
      <TextField 
        label="Search" 
        variant="outlined" 
     
        sx={{ flexGrow: 1, marginBottom: 2 }} 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: "45px",
            height: "40px",
            width: "200px",
            backgroundColor: "#eaf2dd",
            border: "1px solid #405f14",
            color: "#405f14",
            fontWeight: 600,
            boxShadow: "none",
          }}
        >
          Upload Excel File
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!isValidColumn()}
          onClick={handleSaveToDatabase}
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
          Save to Database
        </Button>
        
      </div>

    
                    <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column', // Stack the image and text vertically
                  justifyContent: 'center', // Center everything horizontally
                  alignItems: 'center', // Center everything vertically
                  textAlign: 'center', // Ensure text is centered
                  height: '60vh', // Ensure the parent container takes up the full height of the viewport
                  px: 2, // Optional padding for some space on the sides
                }}
              >

                <Box
                  component="img"
                  src={msexcel}
                  alt="wala"
                  sx={{
                    width: { xs: '45%', sm: '35%', md: '23%', lg: '10%' },
                    height: { xs: '27%', sm: '27%', md: '30%', lg: '27%' },
                    mt: { xs: -10, sm: -5, md: -3, lg: 3 },
                    mb: { xs: -7, sm: -6, md: -3, lg: -3 },
                    margin: '-10% auto 0', // Center the image horizontally and adjust its vertical position
                  }}
                />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: '#3b3c3d', fontWeight: 700, 
                    fontSize: { xs: '35px', sm: '35px', md: '40px', lg: '55px' }, mt: { xs: 5, sm: 5, md: 3, lg: 3 } }}>
                    Note for Users
                  </Typography>
                  <Typography sx={{ color: '#3b3c3d', fontWeight: 600, mt: '3px', fontSize: { xs: '14px', sm: '18px', md: '25px' } }}>
                    To upload your schedule, please follow these steps:
                  </Typography>
                  <Typography sx={{ color: '#727375', fontWeight: 500, mt: '15px', fontSize: { xs: '12px', sm: '15px' }, mb: { xs: 5, sm: 5, md: 4, lg: 5 } }}>
                    -<span style={{ textDecoration: 'underline', color: 'blue' }}>
                      Download the Excel Template
                    </span>.<br />
                    -Follow the example data in the template to ensure proper formatting.<br />
                    -Fill in your own schedule information based on the template structure.<br />
                    -Save the file and upload it to complete the process.
                  </Typography>
                </Box>

              </Box>

      
           
  
      {filteredRows.length > 0 && (
<Box sx = {{bgcolor: ""}}>
<ValidationAlert rows={rows} users={users} isValidColumn={isValidColumn} />
        <StyledTableContainer component={Paper}>

          <Table sx={{ border: "1px solid #D6D7D6", borderRadius: 4, boxShadow: "none"}}>
            <TableBody>
              {filteredRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
               {row.map((cell, cellIndex) => (
                <TableCell
  key={cellIndex}
  sx={{
    backgroundColor: (() => {
      // Regular expressions for validation
      const yearPattern = /^\d{4}-\d{4}$/; // YYYY-YYYY
      const validSemesters = ["1st Sem", "2nd Sem"];
      const numberPattern = /^\d+$/; // Only numbers
      const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/; // HH:mm AM/PM
      const specialCharPattern = /^[a-zA-Z0-9\s]+$/; // No special characters (letters, numbers, spaces only)
      const allowedDays = ["M", "T", "W", "TH", "F", "S"]; // Allowed days

      // Highlight 1st column (Academic Year & Semester) if invalid
      if (cellIndex === 0) {
        if ((rowIndex === 0 && !yearPattern.test(cell)) || (rowIndex === 1 && !validSemesters.includes(cell))) {
          return "rgba(255, 0, 0, 0.3)";
        }
      }
      const expectedHeaders = [
        "SECTION", "CURRICULUM", "COURSE CODE", "COURSE DESCRIPTION", "TOTAL UNITS",
        "DAY", "STIME", "ETIME", "ROOM", "INSTRUCTOR"
    ];
      if (rowIndex === 2 && cell !== expectedHeaders[cellIndex]) {
        return "rgba(255, 0, 0, 0.3)"; // Highlight incorrect headers in red
      }
            // Highlight 6th column (Day) if invalid
            if (cellIndex === 5 && rowIndex >= 3 && !allowedDays.includes(cell?.toString().trim().toUpperCase())) {
              return "rgba(255, 0, 0, 0.3)";
            }

      // Highlight 5th column (Total Units) if not a valid number
      if (cellIndex === 4 && rowIndex >= 3 && !numberPattern.test(cell?.toString().trim())) {
        return "rgba(255, 0, 0, 0.3)";
      }

      // Highlight 7th column (STIME) if not a valid time format
      if (cellIndex === 6 && rowIndex >= 3 && !timePattern.test(cell)) {
        return "rgba(255, 0, 0, 0.3)";
      }

      // Highlight 8th column (ETIME) if not a valid time format
      if (cellIndex === 7 && rowIndex >= 3 && !timePattern.test(cell)) {
        return "rgba(255, 0, 0, 0.3)";
      }

      // Highlight 10th column (Assigned Instructor) if user is not valid
      if (cellIndex === 9 && rowIndex >= 3 && !users.some(user => `${user.firstname} ${user.lastname}` === cell)) {
        return "rgba(255, 0, 0, 0.3)";
      }

      // Highlight Columns 1, 2, 3, 4, 9 (Indexes 0, 1, 2, 3, and 8) if they contain special characters
      if ([0, 1, 2, 3, 8].includes(cellIndex) && rowIndex >= 3 && !specialCharPattern.test(cell?.toString().trim())) {
        return "rgba(255, 0, 0, 0.3)";
      }

      return "inherit"; // Default background
    })(),
  }}
>
{editingRow === rowIndex ? (
  rowIndex === 2 ? ( // Apply text fields only for the 3rd row
    <TextField
      value={cell}
      onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
      fullWidth
      size="small"
    />
  ) : cellIndex === 5 ? (
    <FormControl fullWidth size="small">
      <Select
        value={cell}
        onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
      >
        {["M", "T", "W", "TH", "F", "S"].map((day) => (
          <MenuItem key={day} value={day}>
            {day}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : cellIndex === 9 ? (
    <FormControl fullWidth size="small">
      <Select
        value={cell}
        onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
      >
        {users
          .filter(user => user.role !== 'Admin')
          .map(user => (
            <MenuItem key={user.id} value={`${user.firstname} ${user.lastname}`}>
              {user.firstname} {user.lastname}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  ) : (
    <TextField
      value={cell}
      onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
      fullWidth
      size="small"
    />
  )
) : (
  cell
)}


</TableCell>
))}     
<TableCell>
  {rowIndex < 3 ? (
    // Rows 0 and 1 - Editable but no delete button
    editingRow === rowIndex ? (
      <IconButton onClick={handleSaveRow} color="primary">
        <SaveIcon />
      </IconButton>
    ) : (
      <IconButton onClick={() => handleEditRow(rowIndex)} color="primary">
        <EditIcon />
      </IconButton>
    )
  ) : rowIndex === 2 ? (

    null
  ) : (
    // Rows 3 and beyond - Editable and deletable
    <>
      {editingRow === rowIndex ? (
        <>
          <IconButton onClick={handleSaveRow} color="primary">
            <SaveIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedRowIndex(rowIndex);
              setOpenCreateUserDialog(true);
            }}
            color="primary"
          >
            <PersonAddIcon />
          </IconButton>
        </>
      ) : (
        <IconButton onClick={() => handleEditRow(rowIndex)} color="primary">
          <EditIcon />
        </IconButton>
      )}
      <IconButton onClick={() => handleDeleteRow(rowIndex)} color="error">
        <DeleteIcon />
      </IconButton>
    </>
  )}
</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth  >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, color:'#041129' }}>
            <IconButton edge="start" color="inherit" onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DropZoneContainer {...getRootProps()}>
            <input {...getInputProps()} />
            <img src={folder} alt="Folder" style={{ width: '255px', height: '260px' }} />
            {loading ? (
              <Box>
              <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#041129', fontWeight: 500, fontSize: '24px' }}>
                  Drag & Drop your file here
                </Typography>
                <Typography sx={{ color: '#041129', fontWeight: 300, mt: '5px', fontSize: '18px' }}>
                  OR
                </Typography>
                <Typography sx={{ color: '#041129', fontWeight: 500, borderStyle: 'solid', borderRadius: '45px', borderColor: '#FFC800', backgroundColor: '#FFC800', width: '85%', padding: '10px 0', margin: '10px auto', cursor: 'pointer', fontSize: '18px' }}>
                  Click to Browse
                </Typography>
                <Typography sx={{ color: '#041129', fontWeight: 300, mt: '20px', fontSize: '14px' }}>
                  Supported File Type: Excel (.xlsx, .xls)
                </Typography>
              </Box>
            )}
          </DropZoneContainer>
        </DialogContent>
      </Dialog>

      <Snackbar
  open={openSnackbar}
  autoHideDuration={6000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // This positions it at the top center
>
  <Alert
    onClose={handleCloseSnackbar}
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
<Dialog open={openCreateUserDialog} onClose={() => setOpenCreateUserDialog(false)} maxWidth="sm" fullWidth>
 
  <DialogContent>
    <CreateUser onClose={() => setOpenCreateUserDialog(false)} />
  </DialogContent>
</Dialog>
    </Container>
  );
}

export default AddSchedule;
