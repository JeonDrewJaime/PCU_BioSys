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

  const isValidFirstColumn = () => {
    if (rows.length < 2) return false;
    const yearPattern = /^\d{4}-\d{4}$/; // Matches format YYYY-YYYY
    const validSemesters = ["1st Sem", "2nd Sem"];
  
    return yearPattern.test(rows[0][0]) && validSemesters.includes(rows[1][0]);
  };
  
  
  const handleSaveToDatabase = () => {
    if (!isValidFirstColumn()) {
      setSnackbarMessage('The first column of the first and second rows must be numbers.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
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
  
  

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };


  const filteredRows = rows.filter(row => 
    row.some(cell => cell.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          disabled={!isValidFirstColumn()}
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
          <Table>
            <TableBody>
              {filteredRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
               {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>
  {editingRow === rowIndex ? (
    cellIndex === 9 ? (
      <FormControl fullWidth size="small">
      <Select
        value={cell}
        onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
      >
        {users
          .filter(user => user.role !== 'Admin') // <-- Filter out Admin users
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
