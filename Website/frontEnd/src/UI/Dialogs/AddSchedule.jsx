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
  
    const yearPattern = /^\d{4}-\d{4}$/; // Matches format YYYY-YYYY
    const validSemesters = ["1st Sem", "2nd Sem"];
    const numberPattern = /^\d+$/; // Matches numbers only
    const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/; // Matches HH:mm AM/PM
  
    // Validate first column (Academic Year and Semester)
    const isFirstColumnValid =
      yearPattern.test(rows[0][0]) && validSemesters.includes(rows[1][0]);
  
    // Validate 5th column (index 4) - Must contain only numbers
    const isFifthColumnValid = rows.slice(3).every(row =>
      numberPattern.test(row[4]?.toString().trim()) // Ensures only numeric values
    );
  
    // Validate assigned users in column 10 (index 9)
    const isAllUsersValid = rows.slice(3).every(row =>
      users.some(user => `${user.firstname} ${user.lastname}` === row[9])
    );
  
    // Validate STIME (7th column - index 6) and ETIME (8th column - index 7)
    const isSTIMEValid = rows.slice(3).every(row =>
      timePattern.test(row[6]?.toString().trim())
    );
    const isETIMEValid = rows.slice(3).every(row =>
      timePattern.test(row[7]?.toString().trim())
    );
  
    // Ensure STIME is before ETIME
    const isTimeOrderValid = rows.slice(3).every(row => {
      const startTime = row[6]?.toString().trim();
      const endTime = row[7]?.toString().trim();
  
      if (!startTime || !endTime || !timePattern.test(startTime) || !timePattern.test(endTime)) {
        return false; // Invalid format already caught
      }
  
      // Convert time to Date object for proper comparison
      const parseTime = timeStr => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return new Date(1970, 0, 1, hours, minutes); // Arbitrary date, only time matters
      };
  
      return parseTime(startTime) < parseTime(endTime); // STIME must be before ETIME
    });
  
    return (
      isFirstColumnValid &&
      isFifthColumnValid &&
      isAllUsersValid &&
      isSTIMEValid &&
      isETIMEValid &&
      isTimeOrderValid
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
    <Box sx={{ marginBottom: 2 }}>
      <Alert
        severity={isValidColumn() ? "success" : "error"}
        sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
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
    <Container>
      <div style={{ display: "flex", gap: 10, marginBottom: 10}}>
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
  
      {filteredRows.length > 0 && (

        <StyledTableContainer component={Paper}>
<Box sx={{ marginBottom: 2 }}>
  <Alert
    severity={isValidColumn() ? "success" : "error"}
    sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
  >
    {(() => {
      const yearPattern = /^\d{4}-\d{4}$/; // Matches YYYY-YYYY format
      const validSemesters = ["1st Sem", "2nd Sem"];
      const numberPattern = /^\d+$/; // Matches numbers only
      const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/; // Matches HH:mm AM/PM

      // Extract relevant columns
      const academicYear = rows[0][0]; // Academic Year
      const semester = rows[1][0]; // Semester
      const totalUnitsColumn = rows.slice(3).map(row => row[4]); // 5th column (Total Units)
      const assignedUsers = rows.slice(3).map(row => row[9]); // 10th column (Instructor Name)
      const stimeColumn = rows.slice(3).map(row => row[6]); // 7th column (Start Time)
      const etimeColumn = rows.slice(3).map(row => row[7]); // 8th column (End Time)

      // Helper function to compare STIME and ETIME
      const parseTime = timeStr => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return new Date(1970, 0, 1, hours, minutes); // Arbitrary date, only time matters
      };

      // Validations
      const isAcademicYearValid = yearPattern.test(academicYear);
      const isSemesterValid = validSemesters.includes(semester);
      const isTotalUnitsValid = totalUnitsColumn.every(unit => numberPattern.test(unit?.toString().trim()));
      const isUsersValid = assignedUsers.every(name => users.some(user => `${user.firstname} ${user.lastname}` === name));
      const isSTIMEValid = stimeColumn.every(time => timePattern.test(time?.trim()));
      const isETIMEValid = etimeColumn.every(time => timePattern.test(time?.trim()));

      // Ensure STIME is before ETIME
      const isTimeOrderValid = rows.slice(3).every(row => {
        const startTime = row[6]?.toString().trim();
        const endTime = row[7]?.toString().trim();

        if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
          return false; // Invalid format already caught
        }

        return parseTime(startTime) < parseTime(endTime); // STIME must be before ETIME
      });

      return (
        <>
          {/* ✅ Academic Year Validation */}
          {isAcademicYearValid ? (
            <Typography sx={{ color: "green" }}>✔️ Academic Year format is valid</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Invalid Academic Year format (Expected: YYYY-YYYY)</Typography>
          )}

          {/* ✅ Semester Validation */}
          {isSemesterValid ? (
            <Typography sx={{ color: "green" }}>✔️ Semester format is valid</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Invalid Semester format (Expected: "1st Sem" or "2nd Sem")</Typography>
          )}

          {/* ✅ Total Units Validation */}
          {isTotalUnitsValid ? (
            <Typography sx={{ color: "green" }}>✔️ All Total Units values are valid</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Invalid Total Units found (must be a number)</Typography>
          )}

          {/* ✅ STIME Validation (Start Time) */}
          {isSTIMEValid ? (
            <Typography sx={{ color: "green" }}>✔️ All Start Times (STIME) are valid</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Invalid Start Time (STIME) found (Expected: HH:mm AM/PM)</Typography>
          )}

          {/* ✅ ETIME Validation (End Time) */}
          {isETIMEValid ? (
            <Typography sx={{ color: "green" }}>✔️ All End Times (ETIME) are valid</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Invalid End Time (ETIME) found (Expected: HH:mm AM/PM)</Typography>
          )}

          {/* ✅ STIME vs ETIME Validation */}
          {isTimeOrderValid ? (
            <Typography sx={{ color: "green" }}>✔️ All Start Times are before End Times</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Invalid Time Order: Start Time must be before End Time</Typography>
          )}

          {/* ✅ Assigned User Validation */}
          {isUsersValid ? (
            <Typography sx={{ color: "green" }}>✔️ Assigned user is valid based on registered users</Typography>
          ) : (
            <Typography sx={{ color: "red" }}>❌ Assigned user is not registered</Typography>
          )}
        </>
      );
    })()}
  </Alert>
</Box>




          <Table>
            <TableBody>
              {filteredRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
               {row.map((cell, cellIndex) => (
                <TableCell
  key={cellIndex}
  sx={{
    backgroundColor: (() => {
      // Regular expressions for time format (HH:mm AM/PM)
      const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

      // Highlight 1st column (Academic Year & Semester) if invalid
      if (cellIndex === 0) {
        const yearPattern = /^\d{4}-\d{4}$/;
        const validSemesters = ["1st Sem", "2nd Sem"];
        if ((rowIndex === 0 && !yearPattern.test(cell)) || (rowIndex === 1 && !validSemesters.includes(cell))) {
          return "rgba(255, 0, 0, 0.3)";
        }
      }

      // Highlight 5th column (Total Units) if not a valid number
      if (cellIndex === 4 && rowIndex >= 3 && !/^\d+$/.test(cell?.toString().trim())) {
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

      return "inherit"; // Default background
    })(),
  }}
>
{editingRow === rowIndex ? (
    // Check if it's the second row, first column
    rowIndex === 1 && cellIndex === 0 ? (
      <FormControl fullWidth size="small">
        <Select
          value={cell}
          onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
        >
          <MenuItem value="1st Sem">1st Sem</MenuItem>
          <MenuItem value="2nd Sem">2nd Sem</MenuItem>
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
        size="small"
      />
    )
  ) : (
    cell
  )}
</TableCell>



))}

             
<TableCell>
  {rowIndex < 2 ? (
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
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth >
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
