import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { styled } from '@mui/system';
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

function UploadExcelSchedule({ open, onClose, onFileProcessed }) {
  const [loading, setLoading] = useState(false);
  
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      alert('Invalid file type. Please upload an Excel file (.xlsx, .xls).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLoading(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
    console.log("Raw Data from Excel:", jsonData); // Log raw Excel data
      setTimeout(() => {
        if (jsonData.length > 0) {
          onFileProcessed(jsonData);
          onClose();
        }
        setLoading(false);
      }, 1500);
    };
    reader.readAsArrayBuffer(file);
  }, [onFileProcessed, onClose]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.ms-excel': [],
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, color: '#041129' }}>
          <IconButton edge="start" color="inherit" onClick={onClose}>
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
              <Typography sx={{
                color: '#041129', fontWeight: 500, borderStyle: 'solid',
                borderRadius: '45px', borderColor: '#FFC800', backgroundColor: '#FFC800',
                width: '85%', padding: '10px 0', margin: '10px auto', cursor: 'pointer',
                fontSize: '18px',
              }}>
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
  );
}

export default UploadExcelSchedule;
