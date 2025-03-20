import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, TextField, Button, Checkbox,FormControl,  InputLabel,  Select,  MenuItem,InputAdornment, Tab, Tabs } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';


const BulkEditInstructors = ({ open, onClose, instructors, setInstructors }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAllRows = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      setSelectedRows(instructors.map(person => person.id)); // Select all users
    } else {
      setSelectedRows([]); // Deselect all
    }
  };

  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
          alignItems: "center",    // Center the Alert content horizontally
          width: '100%',            // Optional: Adjust width for better layout control
          maxWidth: '2000px', 
          borderTop:' 3px solid #2083D5',
          bgcolor:'#cce1f4',
          p:2      // Optional: Limit the maximum width
        }}>

          <Typography sx={{ color: "#041129", fontSize: '16px', mb:1, fontWeight:500, mt:-2 }}>
            <InfoIcon sx={{ color: '#15588E', fontSize: 15, mt:2 }} /> This action may replace existing data for the following users.
          </Typography>

          <Typography sx={{ color: "#041129", fontSize: '13px', mb:1, fontWeight:300 }}>
            <strong>Note:</strong> You are about to apply changes to the selected users. These updates will overwrite any existing data for the affected users. <br />
            Please review the list carefully to ensure that the correct users are selected before proceeding.
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
            mb: 4,
            flexWrap: 'wrap', // Allow items to wrap on smaller screens
            p: 2,
            justifyContent: { xs: 'center', sm: 'flex-start' }, 
          
            width: { xs: '100%', sm: '100%', md:'80%', lg:'80%' },
          }}
        >

          {/* Search Field */}
          <TextField
            variant="outlined"
            placeholder="Search..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: '100%', md:'20%', lg:'40%' },
              maxWidth:500,
              minWidth:120, // Make the text field full-width on small screens
              mx: 2,
              borderRadius: '4px',
              mb: { xs: 2, sm: 1, md:0 }, // Add margin bottom on small screens
            }}
          />

          {/* Select All Section */}
          <Box
            sx={{
              border: '1px solid #cccccc',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              minWidth: 137,
              borderRadius: '4px',
              height: '40px',
              width: { xs: '40%', sm: '20%', md:'10%' },
              ml: { xs: 0, sm: 2, md:-1  }, // Remove margin for smaller screens
              mb: { xs: 2, sm: 0 }, // Add margin bottom on small screens for spacing
            }}
          >
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAllRows}
              inputProps={{ 'aria-label': 'select all users' }}
            />
            <Typography variant="body1" sx={{ fontSize: '15px' }}>
              {selectAll ? 'Select None' : 'Select All'}
            </Typography>
          </Box>

          {/* Actions Dropdown */}
          <FormControl
            sx={{
              minWidth: 135,
              mx: 2,
              mr: 1,
              ml:{xs:1,  } ,      
              mb: { xs: 2, sm: 0 }, 
              width: { xs: '40%', sm: '20%', md:'10%' },// Add margin bottom on small screens
            }}
            size="small"
          >
            <InputLabel>Actions</InputLabel>
            <Select value="" displayEmpty>
              <MenuItem value=""></MenuItem>
              <MenuItem value="delete" disabled={selectedRows.length === 0}>
                <DeleteIcon sx={{ marginRight: 1 }} />
                Delete
              </MenuItem>
            </Select>
          </FormControl>

          {/* Save Button */}
          <Button
            variant="contained"
            sx={{
              borderRadius: '45px',
              height: '40px',
              maxWidth: 160,
              width: { xs: '100%', sm: '30%', md:'20%' }, // Full width on small screens
              backgroundColor: '#cceaff',
              border: '1px solid #1a4076',
              color: '#1a4076',
              fontWeight: 600,
              boxShadow: 'none',
              mb: { xs: 2, sm: 0 }, 
              ml: { md:2,lg: 3 }, // Add margin bottom on small screens
            }}
          >
            Save
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',            
            justifyContent: 'center',   
            width: '100%',              
            maxWidth: { xs: '100%', sm: 480, md: 600, lg: 1200 }, 
          
            padding: { xs: 2, sm: 3 },  

          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            sx={{
              width: '100%',            
              maxWidth: { xs: '100%', sm: 480, md: 600, lg: 1000 }, 
            }}
          >
            {Array.from({ length: 20 }, (_, index) => (
              <Tab key={index} label={`Item ${index + 1}`} />
            ))}
          </Tabs>
        </Box>   

      </Box>

      </DialogContent>
    </Dialog>
  );
};

export default BulkEditInstructors;
