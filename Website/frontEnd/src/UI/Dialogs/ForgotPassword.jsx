import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../utils/firebase-config';

function ForgotPassword({ open, onClose }) {
  const [resetEmail, setResetEmail] = useState('');

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Swal.fire('Error', 'Please enter your email.', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Swal.fire('Success', 'Password reset link sent to your email.', 'success');
      onClose(); // Close the dialog after success
      setResetEmail(''); // Clear input field
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"  // controls max width
      fullWidth  // ensures it uses the max width
      sx={{ '& .MuiDialog-paper': { width: 400 } }} // force specific width
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" paddingX={2} paddingTop={1}>
        <DialogTitle sx={{ flexGrow: 1, p: 0, color: "black" }}>Reset Password</DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <TextField
          fullWidth
          label="Enter your email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          margin="dense"
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', paddingRight: 2, paddingBottom: 2 }}>
        <Button variant="contained" onClick={handleForgotPassword}>Send Reset Link</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ForgotPassword;
