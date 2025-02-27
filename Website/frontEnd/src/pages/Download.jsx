import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dlbg from '../assets/dlbg.png';

function Download() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true }); // Initialize AOS
  }, []);

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".accordion-container")) {
        setExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `url(${dlbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Title and Description */}
      <Box
        sx={{
          width: "90%",
          maxWidth: "1200px",
          textAlign: "start",
          p: 1,
          borderRadius: 2,
        }}
        data-aos="fade-up"
      >
        <Typography variant="h4" sx={{ color: "#041129", fontWeight: 700, letterSpacing: 1 }}>
          PCU BioSys Download Archives
        </Typography>

        <Typography variant="h6" sx={{ color: "#171412", fontWeight: 400, letterSpacing: 1, mt: 2 }}>
          Welcome to the PCU BioSys Download Archives. Here, you will find all the latest updates, patches, and previous versions of PCU BioSys.  
          Each version includes new features, security updates, and performance improvements. Older versions are also available for compatibility purposes.  
        </Typography>
      </Box>

      {/* Accordion Sections */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        className="accordion-container"
        sx={{ width: "90%", maxWidth: "1200px", mt: 3 }}
        data-aos="fade-up"
      >
        {/* Version 1.2.0 */}
        <Accordion expanded={expanded === "panel1"} onChange={handleAccordionChange("panel1")} sx={{ width: "100%" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography>
              <Typography component="span" sx={{ color: "#1976D2", fontWeight: 600 }}>Version 1.2.0</Typography> |  
              <Typography component="span" sx={{ color: "#171412", fontWeight: 400 }}> January 15, 2025</Typography>
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            **Patch Notes for Version 1.2.0:**  
            - Improved database performance for faster queries.  
            - New dashboard analytics with real-time data.  
            - Bug fixes addressing user login issues.  
            - Minor UI improvements for better navigation.  
          </AccordionDetails>

          <AccordionActions>
            <Button variant="contained" color="primary">Download</Button>
          </AccordionActions>
        </Accordion>

        {/* Version 1.1.5 */}
        <Accordion expanded={expanded === "panel2"} onChange={handleAccordionChange("panel2")} sx={{ width: "100%" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
            <Typography>
              <Typography component="span" sx={{ color: "#1976D2", fontWeight: 600 }}>Version 1.1.5</Typography> |  
              <Typography component="span" sx={{ color: "#171412", fontWeight: 400 }}> December 10, 2024</Typography>
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            **Patch Notes for Version 1.1.5:**  
            - Fixed an issue where certain reports failed to generate.  
            - Optimized caching for faster load speeds.  
            - Resolved compatibility issues with some browsers.  
            - Improved error handling for failed login attempts.  
          </AccordionDetails>

          <AccordionActions>
            <Button variant="contained" color="primary">Download</Button>
          </AccordionActions>
        </Accordion>
      </Box>
    </Box>
  );
}

export default Download;

