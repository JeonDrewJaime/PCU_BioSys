import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const BulkEditInstructors = ({ open, onClose, instructors, setInstructors }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Bulk Edit Instructors
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {instructors.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {instructors.map((instructor, index) => (
              <Box key={index} sx={{ display: "flex", flexDirection: "column", gap: 1, borderBottom: "1px solid #ddd", paddingBottom: 2 }}>
                <Typography variant="subtitle1">Instructor {index + 1}</Typography>
                <TextField
                  label="Name"
                  value={instructor.name}
                  onChange={(e) => {
                    const updatedInstructors = [...instructors];
                    updatedInstructors[index] = { ...updatedInstructors[index], name: e.target.value };
                    setInstructors(updatedInstructors);
                  }}
                  fullWidth
                />
                <TextField
                  label="Department"
                  value={instructor.department}
                  onChange={(e) => {
                    const updatedInstructors = [...instructors];
                    updatedInstructors[index] = { ...updatedInstructors[index], department: e.target.value };
                    setInstructors(updatedInstructors);
                  }}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={instructor.email}
                  onChange={(e) => {
                    const updatedInstructors = [...instructors];
                    updatedInstructors[index] = { ...updatedInstructors[index], email: e.target.value };
                    setInstructors(updatedInstructors);
                  }}
                  fullWidth
                />
              </Box>
            ))}

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                console.log("Updated Instructors:", instructors);
                onClose();
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditInstructors;
