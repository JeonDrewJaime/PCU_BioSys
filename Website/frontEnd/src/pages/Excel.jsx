import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { styled } from '@mui/system';

const Container = styled('div')(({ theme }) => ({
  padding: '20px',
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxWidth: '100%',
  overflowX: 'auto',  // Ensures horizontal scrolling
  WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
}));

function Excel() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
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
      {rows.length > 0 && (
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
      )}
    </Container>
  );
}

export default Excel;
