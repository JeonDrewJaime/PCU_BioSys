import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import EmailIcon from '@mui/icons-material/Email';
import DraftsIcon from '@mui/icons-material/Drafts';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popover from '@mui/material/Popover';
import LogoutIcon from '@mui/icons-material/Logout';
import Swal from 'sweetalert2';

const drawerWidth = 240;
const drawerBgColor = '#012763';

function DashboardNavbar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState('Inbox');
  const [anchorEl, setAnchorEl] = React.useState(null);

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
    })
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  const renderContent = () => {
    switch (selectedComponent) {
      case 'Inbox':
        return <Typography paragraph>You clicked Inbox!</Typography>;
      case 'Starred':
        return <Typography paragraph>You clicked Starred!</Typography>;
      case 'Send email':
        return <Typography paragraph>You clicked Send email!</Typography>;
      case 'Drafts':
        return <Typography paragraph>You clicked Drafts!</Typography>;
      default:
        return <Typography paragraph>Welcome to the dashboard!</Typography>;
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ textAlign: 'center', mt: -6 }}>
        <Avatar
          alt="PCU Logo"
          src="/path-to-your-logo.png" // Replace this with the correct logo path
          sx={{ width: 80, height: 80, mx: 'auto' }}
        />
        <Typography variant="h6" sx={{ color: 'white', mt: 1 }}>
          Philippine Christian University
        </Typography>
      </Box>
      <Divider />
      <List sx={{ color: 'white' }}>
        {[
          { text: 'Inbox', icon: <InboxIcon /> },
          { text: 'Starred', icon: <MailIcon /> },
          { text: 'Send email', icon: <EmailIcon /> },
          { text: 'Drafts', icon: <DraftsIcon /> },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => setSelectedComponent(item.text)}>
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
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
            <IconButton sx={{ color: '#666666' }}>
              <Badge badgeContent={4} color="primary" overlap="circular">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              onClick={handleProfileClick}
              sx={{ display: 'flex', alignItems: 'center', textTransform: 'none', ml: 2 }}
            >
              <Avatar sx={{ mr: 1, width: 32, height: 32 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
                  John Doe
                </Typography>
                <Typography variant="body2" sx={{ color: 'black' }}>
                  Admin
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
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
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
