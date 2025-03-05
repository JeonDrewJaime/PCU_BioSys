import React from 'react'
import aboutBg from  '../assets/about.jpg';
import { Box, Typography, Grid, Button, Container, List, ListItem,ListItemAvatar,Avatar,ListItemText } from '@mui/material';
import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init();

function About() {
  const developers = [
    { name: 'Jeon Drew Jaime', role: 'try', avatar: '../src/assets/jeon.png' },
    { name: 'Prince Meco Francisco', role: 'try', avatar: '../src/assets/meco.jpg' },
    { name: 'Andrea Teves', role: 'try', avatar: '../src/assets/andeng.jpg' },
    
  ];

  return (
    <div> 

<Box
  sx={{
    width: "100%",
    textAlign: "center",
    py: 5,
    background: `linear-gradient(to bottom, rgba(9, 52, 96, 0.7), rgba(3, 11, 21, 0.9)), url(${aboutBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: { xs: "auto", md: "65vh" },
  }}
>
  <Box
    sx={{
      width: "100%",
      textAlign: "center",
      py: 5,
      borderRadius: 4,
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      p: 4,
    }}
    data-aos="fade-up"
    data-aos-duration="1000"
  >
    {/* Centered Title */}
    <Typography
      variant="subtitle2"
      sx={{
        fontSize: { xs: "20px", sm: "22px", md: "24px" },
        fontWeight: "500",
        color: "#fff",
        mb: -2,
        mt: 5,
        fontFamily: "'Playfair Display', serif",
        fontStyle: "italic",
      }}
      data-aos="fade-in"
      data-aos-duration="1200"
    >
      ABOUT
    </Typography>

    <Typography
      sx={{
        fontWeight: "bold",
        color: "#FFC800",
        transition: "all .50s ease",
        fontSize: { xs: "40px", sm: "50px", md: "70px", lg: "90px" },
      }}
      data-aos="zoom-in"
      data-aos-duration="1300"
    >
      PCU BIOSYS
    </Typography>

    {/* Left-Aligned Description */}
    <Typography
      variant="body1"
      sx={{
        textAlign: "justify",
        mt: 3,
        fontSize: { xs: "14px", sm: "16px", md: "18px" },
        color: "#fff",
        maxWidth: "800px",
        mx: "auto",
        lineHeight: 1.6,
      }}
      data-aos="fade-up"
      data-aos-duration="1500"
    >
      PCU Biosys is an innovative biometric attendance system designed exclusively
      for the faculty of Philippine Christian University (PCU). This system
      streamlines attendance tracking, ensuring accuracy, efficiency, and security 
      in managing faculty attendance records. With PCU Biosys, manual logbooks and 
      outdated tracking methods are a thing of the past. Our system automates attendance 
      logging, providing real-time updates and secure biometric authentication, helping 
      to track faculty performance.
    </Typography>
  </Box>
</Box>

<Box
  sx={{
    width: "100%",
    textAlign: "center",
    py: 5,
    minHeight: "30vh",
    background: "linear-gradient(to bottom, rgb(3, 11, 21), rgb(0, 0, 0))",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <Grid
    container
    spacing={2}
    sx={{ maxWidth: "1200px", px: { xs: 2, sm: 3, md: 4 } }}
  >
    {/* ABOUT US */}
    <Grid item xs={12} md={3} data-aos="fade-right" data-aos-duration="1000">
      <Typography
        variant="h5"
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: "bold",
          color: "#fff",
          mt: 2,
          fontSize: { xs: "20px", sm: "22px", md: "24px", lg: "56px" },
        }}
      >
        ABOUT US
      </Typography>
    </Grid>

    <Grid item xs={12} md={3} data-aos="fade-up" data-aos-duration="1200">
      <Typography
        variant="h6"
        sx={{
          color: "#FFC800",
          fontWeight: "bold",
          mb: 1,
          fontSize: { xs: "16px", sm: "18px", md: "20px", lg: "30px" },
        }}
      >
        Who We Are
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#fff",
          fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
        }}
      >
        We are a team dedicated to modernizing attendance tracking through
        biometric technology. Our goal is to provide organizations with a
        secure, efficient, and accurate way to monitor employee attendance and
        manage records seamlessly.
      </Typography>
    </Grid>

    <Grid item xs={12} md={3} data-aos="fade-up" data-aos-duration="1400">
      <Typography
        variant="h6"
        sx={{
          color: "#FFC800",
          fontWeight: "bold",
          mb: 1,
          fontSize: { xs: "16px", sm: "18px", md: "20px", lg: "30px" },
        }}
      >
        What We Do
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#fff",
          fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
        }}
      >
        Our Biometric Attendance Monitoring System leverages fingerprint
        scanning to accurately log
        attendance in real-time. By combining biometrics with an intuitive
        platform, we help eliminate manual errors and improve transparency.
      </Typography>
    </Grid>

    {/* Our Mission */}
    <Grid item xs={12} md={3} data-aos="fade-left" data-aos-duration="1600">
      <Typography
        variant="h6"
        sx={{
          color: "#FFC800",
          fontWeight: "bold",
          mb: 1,
          fontSize: { xs: "16px", sm: "18px", md: "20px", lg: "30px" },
        }}
      >
        Our Mission
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#fff",
          fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
        }}
      >
        To revolutionize attendance management by providing secure, reliable,
        and hassle-free biometric solutions that enhance productivity and ensure
        accountability within organizations.
      </Typography>
    </Grid>
  </Grid>
</Box>



<Box
  sx={{
    width: "100%",
    textAlign: "center",
    py: { xs: 4, md: 5 },
    height: { xs: "auto", md: "70vh" },
    background: `linear-gradient(to bottom, rgb(0, 0, 0), rgb(10, 25, 47))`,
  }}
>
  <Container>
    <Grid container spacing={4} alignItems="center">
      {/* Left Column - Description */}
      <Grid
        item
        xs={12}
        md={6}
        data-aos="fade-right"
        data-aos-duration="1000"
      >
        <Typography
          sx={{
            fontFamily: "'Kanit', sans-serif",
            fontSize: { xs: 26, sm: 30, md: 35 },
            fontWeight: "bold",
            color: "#FFC800",
            textAlign: "left",
            mb: 2,
            mt: { xs: 2, md: 5 },
          }}
        >
          Creative, Collaborative & Professional
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: { xs: 14, sm: 15, md: 16 },
            fontWeight: 400,
            color: "#fff",
            textAlign: "left",
            lineHeight: 1.6,
          }}
        >
          Our team is driven by innovation, teamwork, and a commitment to excellence. 
          We believe that creativity fuels progress, allowing us to develop intuitive and efficient 
          solutions tailored to modern challenges. Collaboration is at the heart of our process—we work 
          closely with each other, sharing ideas and expertise to bring out the best in our projects. 
          Above all, we maintain a high level of professionalism, ensuring that every system we build 
          is reliable, user-friendly, and meets the highest standards of quality. With a shared vision 
          for technological advancement, we are dedicated to transforming ideas into impactful digital 
          solutions.
        </Typography>
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        data-aos="fade-left"
        data-aos-duration="1200"
      >
        <Box
          sx={{
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            mt: { xs: 3, md: 0 },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: "bold",
              color: "#fff",
              mt: 2,
              fontSize: { xs: "20px", sm: "22px", md: "24px", lg: "26px" },
            }}
          >
            Meet the Developers
          </Typography>

          <List
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center" 
            }}
          >
            {developers.map((developer, index) => (
              <ListItem
                key={index}
                sx={{ paddingLeft: 0, width: "100%", maxWidth: "400px" }}
                data-aos="fade-up"
                data-aos-duration={`${1400 + index * 200}`} // Staggered effect
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={developer.name} 
                    src={developer.avatar} 
                    sx={{ 
                      width: { xs: 56, sm: 64, md: 72 }, 
                      height: { xs: 56, sm: 64, md: 72 } 
                    }} 
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={developer.name}
                  secondary={developer.role}
                  primaryTypographyProps={{
                    sx: {
                      fontFamily: "Kanit",
                      fontSize: { xs: 14, md: 16 },
                      fontWeight: "bold",
                      color: "#fff",
                      ml: 1,
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      fontFamily: "Kanit",
                      fontSize: { xs: 12, md: 14 },
                      color: "#fff",
                      ml: 1,
                      mb: 5,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Grid>
    </Grid>
  </Container>
</Box>

    </div>
  )
}

export default About