import React from 'react';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { useFormik } from 'formik';
import validationSchema from '../../utils/validation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase-config';

function Login() {
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
        alert('Login successful!');
      } catch (error) {
        console.error('Error during login:', error);
        alert('Invalid email or password');
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
        backgroundImage: 'url(https://pcu.edu.ph/wp-content/uploads/elementor/thumbs/school-pic-q2la0qlcmq5sg7szoyo55p45chas82a35dvpa0p4bk.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Card style={{ width: 400, padding: '24px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Login
          </Typography>
          <form onSubmit={formik.handleSubmit} noValidate>
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: '16px' }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
