import { Box, Typography, Grid, Button } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import hero1 from '../assets/1.png';
import hero2 from '../assets/2.png';
import hero3 from '../assets/3.png';
import pcubg from '../assets/pcubg.jpg';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Wave from "react-wavify";
import illustration from '../assets/sampleIllustration.png';
import card1 from  '../assets/biopic1.png';
import card2 from  '../assets/report1.jpg';
import card3 from  '../assets/monitor1.jpg';
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';


AOS.init();

function Home() {
  const slides = [
    { 
      image: hero1, 
      text: (
        <>
          Biometric Attendance <br /> Monitoring System
        </>
      ), 
      subtext: "Philippine Christian University.", 
      align: 'left' 
    },
    { image: hero2, isBoxLayout: true }, 
    { 
      image: hero3, 
      text: "Download BioSys", 
      subtext: "Get the latest version of our biometric system.", 
      description: ( <>Enhance your workforce management with real-time biometric attendance tracking. 
                      Download BioSys today for seamless monitoring and improved efficiency. </>),
      align: 'left',
      isDownloadPage: true 
    }
  ];

  const contentBoxes = [
    {
      title: "Secure & Paperless",
      description: "Modernize attendance tracking with digital solutions."
    },
    {
      title: "Effortless Monitoring",
      description: "Real-time attendance tracking ensures efficiency and transparency for faculty management."
    },
    {
      title: "Seamless Integration",
      description: "Automate records and streamline attendance processes with ease."
    }
  ];

  return (
    <div>
      <Box sx={{ height: { xs: '80vh', sm: '85vh', md: '90vh', lg: '100vh' } }}>
        <Swiper navigation modules={[Navigation]} loop={true} style={{ width: '100%', height: '100%' }}>
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <Box
                sx={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: slide.align === 'left' ? 'flex-start' : 'center', 
                  paddingLeft: slide.align === 'left' ? '10%' : '0', 
                  color: 'white',
                }}
              >
                {slide.isBoxLayout ? (
                <Grid  
                container 
                justifyContent="center" 
                alignItems="center"
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexWrap: 'nowrap', 
                  columnGap: 0, 
                  rowGap: 0, 
                  width: '100%', 
                  margin: '0 auto',
                }}
              >
                {contentBoxes.map((item, i) => (
                  <Grid 
                    item 
                    xs={12} sm={4} 
                    key={i}
                    sx={{ display: 'flex', justifyContent: 'center', flexBasis: '33.33%' }} // Forces equal width
                  >
                    <Box
                    data-aos="flip-up"
                      sx={{
                        
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: { xs: '190px', sm: '300px', md: '380px', lg: '380px' },
                        width: { xs: '90%', sm: '80%', md: '80%', lg: '80%' }, 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '10px',
                        padding: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '1.3rem', sm: '1.5rem', md: '2.3rem', lg: '1.9rem' },
                          fontWeight: 'bold',
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '1rem', md: '1.3rem' },
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
 
                ) : (
                  <Grid 
                  container 
                  sx={{ 
                    maxWidth: { xs: '90%', sm: '75%', md: '70%', lg: '56%', xl: '50%' }, 
                    
                    textAlign: slide.align === 'left' ? 'left' : 'center',
                    justifyContent: slide.align === 'left' ? 'flex-start' : 'center' // ✅ Fixes position
                  }}
                >
                
                    <Typography
                      data-aos="fade-up"
                      data-aos-duration="1000"
                      sx={{
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem', lg: '4rem' },
                        fontWeight: 'bold',
                        color: slide.isDownloadPage ? '#373737' : '#ffffff',
                        textShadow: slide.isDownloadPage ? 'none' : '2px 2px 10px rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      {slide.isDownloadPage ? (
                        <>
                          Download <span style={{ color: '#012763' }}>BioSys</span>
                        </>
                      ) : (
                        slide.text
                      )}
                    </Typography>
                    {slide.subtext && (
                      <Typography
                      data-aos="fade-up"
                        data-aos-delay="300"
                        sx={{
                          fontSize: { xs: '1.2rem', sm: '1.2rem', md: '1.5rem', lg: '2rem' },
                          fontWeight: '500',
                          color: slide.isDownloadPage ? '#373737' : '#ffffff',
                          mt: 2,
                          textShadow: slide.isDownloadPage ? 'none' : '1px 1px 5px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {slide.subtext}
                      </Typography>
                    )}
                    {slide.isDownloadPage && (
                      <>
                        <Typography data-aos="fade-up" data-aos-delay="500" sx={{ fontSize: { xs: '1rem', sm: '1rem', lg: '1.2rem', xl: '1.3rem'}, color: '#373737', mt: 2, mb: 3 }}>
                          {slide.description}
                        </Typography>
                        <Button  data-aos="fade-up"
                      data-aos-delay="700" variant="contained" sx={{ backgroundColor: '#ffcc00', color: '#000', fontWeight: 'bold', px: 3, py: 1.5, fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' }, '&:hover': { backgroundColor: '#ffaa00', ml: '#ffaa00'} }}>
                          Download
                        </Button>
                      </>
                    )}
                  </Grid>
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      <Box sx={{ minHeight: "60vh", position: "relative", overflow: "hidden", mt:-5, display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center',
        alignItems: 'center',color: 'white',
        padding: '20px',
        gap: 4, }}>
      <Wave
        fill="#FFC800"
        options={{
          height: 30,
          amplitude: 40,
          speed: 0.2,
          points: 4,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: "scaleY(-1)", 
        }}
      />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          
            padding: 1,
            maxWidth:{  xs: '200px',
              sm: '200px',
              md: '200px',
              lg: '170px',},
            height: { xs: 'auto', sm: 'auto' },
            overflow: 'visible', 
            mr:{ 
              sm: '-20px',
              md: '-10px',
              lg: '50px',},
              mb:{  xs: '-30px',
                },
          }}
        >
          <Box
            component="img"
            src={illustration}
            alt="wala"
            data-aos="fade-right"
            sx={{
              width: { xs: '150%', sm: '150%', md: '160%', lg: '200%' }, 
              height: { xs: '70%', sm: '70%', md: '160%', lg: '200%' }, 
              mt: { xs: 20, sm: 10, md: 16, lg: 16 },
              mb: {sm: 10, md: 16, lg: 5 },
              position: 'relative',
              margin: '-10% auto 0', 
            }}
          />
        </Box>


        <Box
        sx={{
          flex: 1,
          padding: 3,
          textAlign: { xs: 'center', sm: 'left' },
          maxHeight:{  xs: '200px',
            sm: '400px',
            md: '450px',
            lg: '680px',},
          maxWidth:{  xs: '600px',
            sm: '430px',
            md: '450px',
            lg: '680px',}
        }}
      >
        <Typography
          variant="h4"
          data-aos="fade-left"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '45px', sm: '47px', md: '70px',
              lg: '100px'  },
              mt: { sm: 10, md: 7, lg: 16 },
            marginBottom: '2px',
            color: '#002662',
           
          }}
        >
          PCU Biosys
        </Typography>
        <Typography
          variant="subtitle1"
           data-aos="fade-left"
          sx={{
            fontWeight: '500',
            fontSize: { xs: '13px', sm: '16px', md: '20px',
              lg: '20px'  },
            marginBottom: '20px',
            lineHeight: 1.6,
            color: '#1f2020',mb:{ 
              sm: '30px',
              md: '30px',
              lg: '30px',},
          }}
        >
          Our biometric attendance system simplifies and 
          ecures the process of tracking attendance. Using
          advanced technology like fingerprint and facial
          recognition, it ensures accurate and reliable
          records without the need for manual input. 
        </Typography>

        </Box>
    </Box> 

            <div 
          data-aos="zoom-out" 
          data-aos-duration="2000" 
        >
 
          <Box sx={{ 
          width: '100%',
          textAlign: 'center', 
          py: 5, 
          background: `linear-gradient(rgba(29, 29, 29, 0.8), rgb(80, 80, 80, 0.8)), url(${pcubg})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
      }}>

          {/* Features Title */}
          <Typography 
            variant="h4" 
            data-aos="fade-up"
            data-aos-delay="300"
            sx={{
              color: "white", 
              fontWeight: "bold", 
              textTransform: "uppercase",
              letterSpacing: 1.5,
              mb: 4 
            }}>
            Features
          </Typography>

          {/* Cards Container */}
          <Box sx={{
              display: 'flex',
              flexWrap: 'wrap', 
              justifyContent: 'center',           
              alignItems: 'center',              
              gap: '25px',                       
              overflow: "hidden",
              px: 3, 
          }}>

            {/* Card Components */}
            {[card1, card2, card3].map((card, index) => (
              <Card key={index} data-aos="zoom-in" data-aos-delay="700" sx={{ maxWidth: 350, minHeight: 450, backgroundColor: "white" }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="240"
                    image={card} 
                    alt={`Feature ${index + 1}`}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div" align='start' 
                      sx={{
                        fontSize: { xs: '20px', sm: '25px', md: '27px', lg: '30px' },
                        fontWeight:600,
                        mt: 3, mb: 1,
                      }}>
                      {index === 0 ? "Biometric Attendance Tracking" : 
                      index === 1 ? "Automated Attendance Reports" : 
                      "Real-Time Status Monitoring"}
                    </Typography>
                    <Typography variant="body2" align='start' sx={{ color: 'text.secondary', mb: 6 }}>
                      {index === 0 ? "Utilizes fingerprint or facial recognition to accurately record faculty attendance, ensuring a secure and tamper-proof system." :
                      index === 1 ? "Automatically compiles attendance data into real-time reports, allowing administrators to track attendance trends and evaluate punctuality." :
                      "Enables administrators to access up-to-date faculty attendance records, showing who is present, absent, or has yet to check in."}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}

          </Box>
      </Box>
      </div>
    </div>
  );
}

export default Home;


