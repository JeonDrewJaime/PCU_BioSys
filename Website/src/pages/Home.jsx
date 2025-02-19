import Footer from '../components/Footer';
import { Typography, Button, Box } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import pcubg from '../assets/pcubg.jpg';

function Home() {
  const slides = [
    {
      title: 'Welcome to Our Platform',
      subtitle: 'Discover amazing features and seamless experiences.',
      buttonText: 'Get Started',
      backgroundColor: 'rgba(56, 81, 135, 0.5)',
    },
    {
      title: 'Enhance Productivity',
      subtitle: 'Tools designed to maximize your workflow.',
      buttonText: 'Explore More',
      backgroundColor: 'rgba(216, 187, 114, 0.5)',
    },
    {
      title: 'Join the Community',
      subtitle: 'Connect with like-minded innovators.',
      buttonText: 'Join Now',
      backgroundColor: 'rgba(250, 232, 232, 0.5)',
    },
  ];

  return (
    <div>
      {/* Hero Section Slider */}
      <Swiper 
        navigation 
        modules={[Navigation]} 
        loop={true}
        style={{ width: '100%', height: '100vh' }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{ 
                backgroundColor: slide.backgroundColor,
                backgroundImage: `url(${pcubg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                color: 'white', 
                py: 10, 
                textAlign: 'center', 
                height: '100vh'
              }}
            >
              <Typography variant="h2" component="h1" gutterBottom>
                {slide.title}
              </Typography>
              <Typography variant="h5" gutterBottom>
                {slide.subtitle}
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ mt: 3 }}
              >
                {slide.buttonText}
              </Button>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <Box sx={{ height: "70vh" }}>

      </Box>
   
  
    </div>
  );
}

export default Home;

