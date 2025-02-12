import React from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import footerpic from '../assets/pcu_logo_nobg_white.png'


function Footer() {
  return (
    <Box sx={{ backgroundColor: "#012763", padding: "40px 0", color: "white",  textAlign: 'center',  }}>
        
             
             <img
                 src={footerpic}
                 alt="Logo"
                 style={{
                   width: '105px',
                   height: '55px',
                                  
                   
                 }}></img>


            <Typography
                
                sx={{ color: 'white', fontWeight: 50, fontSize: '14px', marginTop: '16px' }}
              >
             1648 Taft Avenue corner Pedro Gil St., Malate, Manila
              </Typography>

              <Typography
                
                sx={{ color: 'white', fontWeight: 50, fontSize: '14px', marginTop: '16px' }}
              >
             Working Hours <br/>
             Monday - Saturday <br/>
             8 am - 5 pm <br/>
             Sunday - Closed <br/>
              </Typography>



      
     
    </Box>
  );
}

export default Footer;
