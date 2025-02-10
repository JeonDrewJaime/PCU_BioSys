import React from "react";
import { Container, Grid, Typography, Box } from "@mui/material";

function Footer() {
  return (
    <Box sx={{ backgroundColor: "#012763", padding: "40px 0", color: "white"  }}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Column 1
            </Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Column 2
            </Typography>
            <Typography variant="body2">
              Nullam id dolor id nibh ultricies vehicula ut id elit.
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Column 3
            </Typography>
            <Typography variant="body2">
              Donec ullamcorper nulla non metus auctor fringilla.
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Column 4
            </Typography>
            <Typography variant="body2">
              Etiam porta sem malesuada magna mollis euismod.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;
