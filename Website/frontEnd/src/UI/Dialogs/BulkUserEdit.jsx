import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, TextField, Button, Checkbox,FormControl,  InputLabel,  Select,  MenuItem,InputAdornment, Tab, Tabs } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';



const BulkUserEdit = ({ open, onClose, }) => {


  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{color:"#041129", fontSize:{xs:"20px", sm:"24px", md:"30px", lg:"32px"}, fontWeight:"600", mb:-1}}>
        Edit 
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
       <Divider variant="middle" />
      <DialogContent>

      <Box sx={{
        display: 'flex',          
        flexDirection: 'column',  
        alignItems: 'center',     
        textAlign: 'center',    
        marginBottom: 2,          
        height: '35vh',           
      }}>

        <Box sx={{
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",    
          width: '90%',           
          maxWidth: '2000px', 
          borderTop:' 3px solid #2083D5',
          bgcolor:'#cce1f4',
          p:2      
        }}>

          <Typography sx={{ color: "#041129", fontSize: '14px', mb:1, fontWeight:500, mt:-2 }}>
            <InfoIcon sx={{ color: '#15588E', fontSize: 15, mt:2 }} /> This action may replace existing data for the following users.
          </Typography>

          <Typography sx={{ color: "#041129", fontSize: '11px', mb:1, fontWeight:300 }}>
            <strong>Note:</strong> You are about to apply changes to the selected users. These updates will overwrite any existing data for the affected users. Please review the list carefully to ensure that the correct users are selected before proceeding.
          </Typography>

        </Box>

        <Typography sx={{ color: "#041129", fontSize: '14px', mt:2, mb:1, fontWeight:300 }}>
          Apply changes to:
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip label="Deletable" onDelete={handleDelete} />
          <Chip label="Deletable" variant="outlined" onDelete={handleDelete} />
        </Stack>
       


           <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
                flexWrap: 'wrap', 
                p: 2,
                justifyContent: 'center',
            
                width: '90%',
                mb:1
              }}
            >
              {/* Department Select */}
              <FormControl
                sx={{
                  minWidth: { xs: '100%', sm: 200 }, // Full width on small screens, fixed width on larger screens
                  mb: { xs: 2, sm: 0 }, // Add margin-bottom on small screens
                  mr: { sm: 2 }, // Add margin-right on larger screens for spacing
                }}
                size="small"
              >
                <InputLabel>Department</InputLabel>
                <Select
                  defaultValue=""
                  label="Department"
                  // Add your options here
                >
                  <MenuItem value="computer_engineering">Computer Engineering</MenuItem>
                  <MenuItem value="computer_science">Computer Science</MenuItem>
                  <MenuItem value="information_technology">Information Technology</MenuItem>
                </Select>
              </FormControl>

              {/* Role Select */}
              <FormControl
                sx={{
                  minWidth: { xs: '100%', sm: 200 }, // Full width on small screens, fixed width on larger screens
                  mb: { xs: 2, sm: 0 }, // Add margin-bottom on small screens
                }}
                size="small"
              >
                <InputLabel>Role</InputLabel>
                <Select
                  defaultValue=""
                  label="Role"
                  // Add your options here
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                </Select>
              </FormControl>
            </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1,
            flexWrap: 'wrap', // Allow items to wrap on smaller screens
            p: 2,
            justifyContent:'flex-end', 
            width: '90%',
          }}
        >
          
          {/* Save Button */}
          <Button
            variant="contained"
            sx={{
              borderRadius: '45px',
              height: '40px',
              maxWidth: 160,
              width: { xs: '100%' }, // Full width on small screens
              backgroundColor: '#cceaff',
              border: '1px solid #1a4076',
              color: '#1a4076',
              fontWeight: 600,
              boxShadow: 'none',

            }}
          >
            Save
          </Button>
        </Box>

      </Box>

      </DialogContent>
    </Dialog>
  );
};

export default BulkUserEdit;
