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

const versions = [
  {
    version: "1.2.0",
    date: "January 15, 2025",
    notes: [
      "Improved database performance for faster queries.",
      "New dashboard analytics with real-time data.",
      "Bug fixes addressing user login issues.",
      "Minor UI improvements for better navigation."
    ],
    downloadUrl: "/downloads/meco.jpg"   // Place meco.jpg inside public/downloads/
  },
  {
    version: "1.1.5",
    date: "December 10, 2024",
    notes: [
      "Fixed an issue where certain reports failed to generate.",
      "Optimized caching for faster load speeds.",
      "Resolved compatibility issues with some browsers.",
      "Improved error handling for failed login attempts."
    ],
    downloadUrl: "/downloads/PCU-BioSys-v1.1.5.zip"  // Place PCU-BioSys-v1.1.5.zip inside public/downloads/
  }
];


function Download() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');  // optional: can be set if you want to force a download instead of opening in browser
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        {versions.map((ver, index) => (
          <Accordion
            key={ver.version}
            expanded={expanded === `panel${index + 1}`}
            onChange={handleAccordionChange(`panel${index + 1}`)}
            sx={{ width: "100%" }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${index + 1}-content`} id={`panel${index + 1}-header`}>
              <Typography>
                <Typography component="span" sx={{ color: "#1976D2", fontWeight: 600 }}>Version {ver.version}</Typography> |{" "}
                <Typography component="span" sx={{ color: "#171412", fontWeight: 400 }}>{ver.date}</Typography>
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography sx={{ whiteSpace: "pre-line" }}>
                <strong>Patch Notes for Version {ver.version}:</strong>{"\n"}
                {ver.notes.map((note, idx) => `- ${note}\n`).join("")}
              </Typography>
            </AccordionDetails>

            <AccordionActions>
            <Button variant="contained" color="primary" onClick={() => handleDownload(ver.downloadUrl)}>
  Download
</Button>

            </AccordionActions>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

export default Download;
