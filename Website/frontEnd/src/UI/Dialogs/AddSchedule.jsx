import React, { useState, useCallback } from 'react';
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

function AddSchedule() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchQuery, setSearchQuery] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

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

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx, .xls' });

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

  const handleSaveToDatabase = () => {
    setLoading(true);
    saveExcelData(columns, rows)
      .then(() => {
        setSnackbarMessage('Content saved to the database successfully.');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setOpenDialog(false);
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
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort</InputLabel>
          <Select displayEmpty>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Faculty">Faculty</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            mb: '20px',
            borderRadius: '45px',
            height: '40px',
            width: '200px',
            backgroundColor: '#E4E4F1',
            borderColor: '#012763',
            color: '#012763',
            fontWeight: 600,
          }}
        >
          Upload Excel File
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveToDatabase}
          sx={{
            mb: '20px',
            borderRadius: '45px',
            height: '40px',
            width: '200px',
            backgroundColor: '#E4E4F1',
            borderColor: '#012763',
            color: '#012763',
            fontWeight: 600,
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
                        <TextField
                          value={cell}
                          onChange={(e) => handleChangeCell(rowIndex, cellIndex, e.target.value)}
                          size="small"
                        />
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
             
                  {rowIndex >= 2 && (
                    <TableCell>
                        
                      {editingRow === rowIndex ? (
                        
                        <IconButton onClick={handleSaveRow} color="primary">
                          <SaveIcon />
                    
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleEditRow(rowIndex)} color="primary">
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={() => handleDeleteRow(rowIndex)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
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

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddSchedule;
