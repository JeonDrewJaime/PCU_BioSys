import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/Login';
import Download from '../pages/Download';
import SignUp from '../pages/SignUp';
import Footer from './Footer';
import GlobalStyles from '../../utils/GlobalStyles';
import logo from '../assets/pculogo.png';

const drawerWidth = 240;
const navItems = [
  { label: 'Home', component: <Home /> },
  { label: 'About', component: <About /> },
  { label: 'Download', component: <Download /> },
];

function HomeNavbar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeComponent, setActiveComponent] = React.useState(<Home />);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleNavClick = (component) => {
    setActiveComponent(component);
    setMobileOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavClick(item.component)} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <GlobalStyles />
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <CssBaseline />
        <AppBar component="nav" sx={{ backgroundColor: 'white' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: 'var(--pri)' }}
            >
              <MenuIcon />
            </IconButton>
            <img src={logo} alt="Logo" style={{ width: '55px', height: '45px', marginRight: '15px' }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontFamily: 'OldEnglish',
                fontSize: { xs: '21px', sm: '25px', md: '30px', lg: '40px' },
                color: 'var(--pri)'
              }}
            >
              Philippine Christian University
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
  {navItems.map((item) => (
    <Button
      key={item.label}
      onClick={() => handleNavClick(item.component)}
      sx={{
        color: 'var(--pri)',
        marginLeft: '15px',height: '63px',
        position: 'relative',
        border: 'none',
        '&:hover': { 
          '&::after': {
            content: "''",
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',    
            height: '3px', // Set the thickness of the bottom border
            backgroundColor: '#FFC800', // Bottom border color
            transform: 'scaleX(1)',
            transformOrigin: 'bottom right',
            transition: 'transform 0.3s ease-out', // smooth transition for the effect
          },
        },
        '&::after': {
          content: "''",
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          backgroundColor: '#FFC800',
          transform: 'scaleX(0)', // Initially hidden
          transformOrigin: 'bottom right',
          transition: 'transform 0.3s ease-out',
        },
      }}
    >
      {item.label}
    </Button>
  ))}
</Box>

            <Button
  onClick={() => handleNavClick(<Login setActiveComponent={setActiveComponent} />)}
  sx={{
    outline: 'none',
    border: '1px solid transparent',
    backgroundColor: '#FFC800',
    color: '#000000',
    fontFamily: 'sans-serif',
    transition: 'all 0.3s ease',
    marginLeft: '15px',
    padding: {
      xs: '6px 12px',
      sm: '8px 14px',
      md: '8px 20px',
      lg: '8px 40px',
    },
    fontSize: {
      xs: '10px',
      sm: '11px',
      md: '12px',
      lg: '15px',
    },
    fontWeight: '500',
    '&:hover': {
      backgroundColor: '#0087E0',
      color: '#FFFFFF',
      border: '1px solid #0087E0',
    },
  }}
>
  Login
</Button>


          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </nav>

        <Box component="main" sx={{ flexGrow: 1, width: '100%', mt: 8, px: 0 }}>
          {activeComponent}
        </Box>
      </Box>
      <Footer />
    </>
  );
}

HomeNavbar.propTypes = {
  window: PropTypes.func,
};

export default HomeNavbar;
