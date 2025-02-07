import React, { useState } from 'react';
import {
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import * as XLSX from 'xlsx';
import { styled } from '@mui/system';
import { handleSaveExcelContent } from '../../APIs/Admin';

const MAX_COLUMNS = 10; // Set column limit

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

function Excel() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setDialogMessage('Invalid file format. Please upload an Excel file (.xlsx or .xls).');
      setOpenDialog(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        if (jsonData[0].length > MAX_COLUMNS) {
          setDialogMessage(`The uploaded file has more than ${MAX_COLUMNS} columns. Please upload a file with fewer columns.`);
          setOpenDialog(true);
          return;
        }
        if (jsonData.length === 1 || jsonData.slice(1).every(row => row.every(cell => cell === undefined || cell === ''))) {
          setDialogMessage('The uploaded file contains no data rows. Please upload a valid file.');
          setOpenDialog(true);
          return;
        }

        setColumns(jsonData[0]);
        setRows(jsonData.slice(1));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedRows = [...rows];
    if (!updatedRows[rowIndex]) {
      updatedRows[rowIndex] = [];
    }
    updatedRows[rowIndex][colIndex] = value;
    setRows(updatedRows);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Excel File Uploader
      </Typography>
      <Button
        variant="contained"
        component="label"
        style={{ marginBottom: '20px' }}
      >
        Upload Excel File
        <input
          type="file"
          accept=".xlsx, .xls"
          hidden
          onChange={handleFileUpload}
        />
      </Button>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Invalid File</DialogTitle>
        <DialogContent>
          {dialogMessage}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {rows.length > 0 && (
        <>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index} style={{ fontWeight: 'bold' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          value={row[colIndex] || ''}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSaveExcelContent(columns, rows)}
            style={{ marginTop: '20px' }}
          >
            Save to Firebase
          </Button>
        </>
      )}
    </Container>
  );
}

export default Excel;
