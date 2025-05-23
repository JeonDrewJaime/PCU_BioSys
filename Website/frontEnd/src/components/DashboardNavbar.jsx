import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import DraftsIcon from '@mui/icons-material/Drafts';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; // Import the ico
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import People from '../pages/People'
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popover from '@mui/material/Popover';
import LogoutIcon from '@mui/icons-material/Logout';
import { fetchUserById } from '../../APIs/adminAPI';

import Swal from 'sweetalert2';
import AddSchedule from '../UI/Dialogs/AddSchedule';
import Dashboard from '../pages/Dashboard';
import GlobalStyles from '../../utils/GlobalStyles';
import ScheduleManagement from '../pages/ScheduleManagement';
import logo from '../assets/pcu_logo_nobg_white.png'
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase-config"; // Import your Firebase auth instance
import Profile from '../pages/Profile';
import Loader from '../pages/Loader';

const drawerWidth = 240;
const drawerBgColor = '#012763';




function getInitials(name) {
  if (!name) return "U"; // Fallback if name isn't loaded yet
  const nameParts = name.split(" ");
  const initials = nameParts.map(part => part.charAt(0)).join('');
  return initials.toUpperCase();
}

function DashboardNavbar(props) {

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentDateTime(new Date());
  }, 1000);

  return () => clearInterval(timer); // cleanup
}, []);
  

  const [loading, setLoading] = React.useState(true);

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState('Inbox');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, setUser] = React.useState({ name: "Loading...", role: "Loading..." });
  const navigate = useNavigate(); // Initialize navigation
  const menuItems = [
    { text: 'Dashboard', icon: <SpaceDashboardIcon/> },
   
  ];
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000); // 5 seconds
    return () => clearTimeout(timer);
}, []);
  if (user.role === 'Admin') {
    menuItems.push({ text: 'People', icon: <PeopleIcon/> });
    menuItems.push({ text: 'Schedule Management', icon: <CalendarMonthIcon/> });

  }

  if (user.role === 'Faculty') {
    menuItems.push({ text: 'Profile', icon: <AccountBoxIcon/>});
  }
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Logged out!',
              text: 'You have been logged out successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            navigate("/"); // Redirect to login page after logout
          })
          .catch((error) => {
            console.error("Logout error:", error);
            Swal.fire({
              icon: 'error',
              title: 'Logout Failed',
              text: 'Something went wrong. Please try again.',
            });
          });
      }
    });
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  const renderContent = () => {
  

    switch (selectedComponent) {
        case 'Dashboard':
            return <Dashboard />;
        case 'People':
            return <People />;
        case 'Schedule Management':
            return <ScheduleManagement />;
        case 'Profile':
            return <Profile />;
        default:
            return <Dashboard />;
    }
};

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userData = await fetchUserById(currentUser.uid);
          if (userData) {
            setUser({ name: `${userData.firstname} ${userData.lastname}`, role: userData.role });
          } else {
            setUser({ name: "Unknown", role: "N/A" });
          }
        } else {
          setUser({ name: "Guest", role: "Unknown" });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }, []);
  




  const drawer = (
    <div>
      <Toolbar />
      <Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    height: '90vh',
    overflow: 'hidden', // prevents scroll
    justifyContent: 'space-between',
    color: 'white',
  }}
>
  {/* TOP PART - LOGO + MENU */}
  <Box>
    <Toolbar sx={{overflow: 'hidden'}}/>
    <Box sx={{ textAlign: 'center', mt: -8 }}>
      <Avatar
        alt="PCU Logo"
        src={logo}
        sx={{ width: 100, height: 100, mx: 'auto' }}
      />
    </Box>
    <Divider sx={{ mb: 4 }} />
    <List sx={{ color: 'white' }}>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            onClick={() => setSelectedComponent(item.text)}
            sx={{
              '&:hover': {
                backgroundColor: '#ffffff33',
              },
              backgroundColor:
                selectedComponent === item.text ? '#ffffff22' : 'transparent',
              borderRadius: 1,
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: item.text === 'Schedule Management' ? '14px' : '15px',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Box>

  {/* BOTTOM FIXED DATE & TIME */}
  <Box sx={{ textAlign: 'center', py: 2, }}>
    <Typography variant="body2" sx={{fontSize:'14px', color:'#E8E9ED', fontWeight:100}}>
      {currentDateTime.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
    </Typography>
    <Typography variant="body2"  sx={{fontSize:'13px', color:'#E8E9ED', fontWeight:100}}>
      {currentDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })}{' '}
      • {currentDateTime.toLocaleDateString('en-US', { weekday: 'long' })}
    </Typography>
  </Box>
</Box>



    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    
    <Box sx={{ display: 'flex' }}>
      <GlobalStyles/>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#FFFFFF',
        }}
      >
        <Toolbar sx={{ px: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon sx={{ color: 'black' }} />
          </IconButton>

          <Box
    sx={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto',
    }}
>
    <IconButton
        onClick={handleProfileClick}
        sx={{ display: 'flex', alignItems: 'center', textTransform: 'none', ml: 2 }}
    >
        <Avatar sx={{ mr: 1, width: 35, height: 35 }}>
            {getInitials(user.name)}
        </Avatar>
         <KeyboardArrowDownIcon sx={{ color: 'black' }} />  {/* <-- Dropdown icon here */}
        <Box sx={{ textAlign: 'left', mr: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
                {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'black' }}>
                {user.role}
            </Typography>
        </Box>
       
    </IconButton>
</Box>
        </Toolbar>
      </AppBar>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List sx={{ p: 0 }}>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Popover>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: drawerBgColor },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: drawerBgColor },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: "#f5f5fb", height: "100vh" }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}

DashboardNavbar.propTypes = {
  window: PropTypes.func,
};

export default DashboardNavbar;
