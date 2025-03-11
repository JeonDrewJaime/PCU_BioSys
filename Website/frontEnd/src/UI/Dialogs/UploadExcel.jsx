import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/system';
import * as XLSX from 'xlsx';
import folder from '../../assets/folder.png';

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

const UploadExcel = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setLoading(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        setTableData(jsonData);
        setOpenDialog(true);
      }

      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
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
            <Typography
              sx={{
                color: '#041129',
                fontWeight: 500,
                borderStyle: 'solid',
                borderRadius: '45px',
                borderColor: '#FFC800',
                backgroundColor: '#FFC800',
                width: '85%',
                padding: '10px 0',
                margin: '10px auto',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              Click to Browse
            </Typography>
            <Typography sx={{ color: '#041129', fontWeight: 300, mt: '20px', fontSize: '14px' }}>
              Supported File Type: Excel (.xlsx, .xls)
            </Typography>
          </Box>
        )}
      </DropZoneContainer>

      {/* Dialog to Display Table Data */}
      <Dialog open={openDialog} fullWidth maxWidth="md">
        <DialogTitle>Uploaded File Data</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {tableData[0]?.map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadExcel;
