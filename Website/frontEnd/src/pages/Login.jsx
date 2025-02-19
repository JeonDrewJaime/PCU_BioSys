import React, { useEffect } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';
import validationSchema from '../../utils/validation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase-config';
import Footer from '../components/Footer';
import pcubg from '../assets/pcubg.jpg';
import SignUp from './SignUp'; // Import SignUp component

function Login({ setActiveComponent }) {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        console.log('User logged in:', userCredential.user);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting to dashboard...',
          timer: 2000,
          showConfirmButton: false
        });
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error('Error during login:', error);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password. Please try again.',
        });
      }
    }
  });

  return (
    <>
      <Box
        fullWidth
        sx={{
          height: '100vh',
          display: 'grid',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(rgba(10, 8, 47, 0.5), rgb(18, 25, 104)), url(${pcubg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Card
          data-aos="fade-up"
          style={{
            width: 420,
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            backgroundColor: '#FAFAFF',
            opacity: '85%'
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ color: '#041129', fontWeight: 900, letterSpacing: 1 }}
            >
              Login
            </Typography>

            <Typography
              gutterBottom
              align="center"
              sx={{ color: '#606369', fontWeight: 100, fontSize: '16px', marginBottom: '16px', marginTop: '-8px' }}
            >
              Your workspace awaits—welcome back.
            </Typography>

            <form onSubmit={formik.handleSubmit} noValidate data-aos="zoom-in">
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                variant="outlined"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                variant="outlined"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />

              <Typography
                gutterBottom
                align="end"
                sx={{ color: '#606369', fontWeight: 100, fontSize: '14px' }}
              >
                Forgot password?
              </Typography>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                style={{
                  marginTop: '16px',
                  height: '50px',
                  borderRadius: '45px',
                  backgroundColor: 'var(--sec)',
                  color: '#000000',
                  fontSize: '20px'
                }}
                data-aos="fade-right"
              >
                Login
              </Button>

              <Typography
                gutterBottom
                align="center"
                sx={{ color: '#606369', fontWeight: 50, fontSize: '14px', marginTop: '26px' }}
              >
                Don't have an account yet?
                <Button
                  variant="text"
                  sx={{ px: 1, fontWeight: 500, textTransform: 'none', color: 'var(--pri)' }}
                  onClick={() => setActiveComponent(<SignUp setActiveComponent={setActiveComponent} />)}
                >
                  Register Now
                </Button>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    
    </>
  );
}

export default Login;
