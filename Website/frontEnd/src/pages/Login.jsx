import React, { useEffect } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, FormControlLabel, Checkbox } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase-config';
import pcubg from '../assets/pcubg.jpg';
import SignUp from './SignUp';
const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  rememberMe: Yup.boolean(),
});

function Login({ setActiveComponent }) {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: localStorage.getItem('rememberedEmail') || '',
      password: '',
      rememberMe: localStorage.getItem('rememberedEmail') ? true : false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        console.log('User logged in:', userCredential.user);

        if (values.rememberMe) {
          localStorage.setItem('rememberedEmail', values.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

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
      <Card data-aos="fade-up" sx={{ width: 420, padding: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#FAFAFF', opacity: 0.85 }}>
        <CardContent>
          <Typography variant="h4" align="center" sx={{ color: '#041129', fontWeight: 700 }}>Login</Typography>
          <Typography align="center" sx={{ color: '#606369', fontSize: 17, mb: 2 }}>Your workspace awaits—welcome back.</Typography>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              variant="outlined"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              variant="outlined"
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <FormControlLabel
              control={<Checkbox name="rememberMe" checked={formik.values.rememberMe} onChange={formik.handleChange} />}
              label="Remember Me"
            />

<Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                height: 50,
                borderRadius: 45,
                backgroundColor: 'var(--sec)',
                color: '#000',
                fontSize: 20
              }}
            >
              Login
            </Button>
          </form>

          <Typography align="center" sx={{ color: '#606369', fontSize: 14, mt: 3 }}>
              Don't have an account yet?
              <Button
                variant="text"
                sx={{ px: 1, fontWeight: 500, textTransform: 'none', color: 'var(--pri)' }}
                onClick={() => setActiveComponent(<SignUp setActiveComponent={setActiveComponent} />)}
              >
                Register Now
              </Button>
            </Typography>

        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
