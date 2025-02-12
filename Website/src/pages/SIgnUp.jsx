import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, Stepper, Step, StepLabel, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../../utils/firebase-config';
import Footer from '../components/Footer';
import pcubg from '../assets/pcubg.jpg';

const steps = ['Account Details', 'Personal Information', 'Password Setup'];

const validationSchemas = [
  Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
  }),
  Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    department: Yup.string().required('Department is required'),
  }),
  Yup.object({
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  }),
];

function SignUp() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const formik = useFormik({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      department: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchemas[activeStep],
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (activeStep === steps.length - 1) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const user = userCredential.user;

          // Store user details in Firebase Realtime Database
          await set(ref(database, `users/${values.department}/${user.uid}`), {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            department: values.department,
          });

          // SweetAlert success message
          Swal.fire({
            title: 'Registration Successful!',
            text: 'Your account has been created successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            navigate('/login');
          });

        } catch (error) {
          console.error('Error during sign up:', error);

          // SweetAlert error message
          Swal.fire({
            title: 'Sign Up Failed',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      } else {
        setActiveStep((prev) => prev + 1);
      }
    },
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
          backgroundPosition: 'center',
        }}
      >
        <Card data-aos="fade-up" sx={{ width: 420, padding: '24px', borderRadius: '16px', boxShadow: 3, backgroundColor: '#FAFAFF', opacity: 0.85 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" sx={{ color: '#041129', fontWeight: 900, letterSpacing: 1 }}>
              Create Your Account
            </Typography>
            <Typography
              gutterBottom
              align="center"
              sx={{ color: '#606369', fontWeight: 100, fontSize: '12px', marginBottom: '28px', marginTop: '-8px',  }}
            >
              Start your journey with us today—it only takes a minute!
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <form onSubmit={formik.handleSubmit} noValidate>
              {activeStep === 0 && (
                <TextField fullWidth margin="normal" label="Email" {...formik.getFieldProps('email')} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} />
              )}
              {activeStep === 1 && (
                <>
                  <TextField fullWidth margin="normal" label="First Name" {...formik.getFieldProps('firstName')} error={formik.touched.firstName && Boolean(formik.errors.firstName)} helperText={formik.touched.firstName && formik.errors.firstName} />
                  <TextField fullWidth margin="normal" label="Last Name" {...formik.getFieldProps('lastName')} error={formik.touched.lastName && Boolean(formik.errors.lastName)} helperText={formik.touched.lastName && formik.errors.lastName} />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Department</InputLabel>
                    <Select {...formik.getFieldProps('department')} error={formik.touched.department && Boolean(formik.errors.department)}>
                      <MenuItem value="Faculty">Faculty</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
              {activeStep === 2 && (
                <>
                  <TextField fullWidth margin="normal" label="Password" type="password" {...formik.getFieldProps('password')} error={formik.touched.password && Boolean(formik.errors.password)} helperText={formik.touched.password && formik.errors.password} />
                  <TextField fullWidth margin="normal" label="Confirm Password" type="password" {...formik.getFieldProps('confirmPassword')} error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)} helperText={formik.touched.confirmPassword && formik.errors.confirmPassword} />
                </>
              )}
              <Box display="flex" justifyContent="space-between" mt={2}>
                {activeStep > 0 && (
                  <Button variant="outlined" sx={{ borderRadius: '45px', height: '45px', width:'115px', backgroundColor:'#E4E4F1', borderColor:'#012763', color:'#012763', fontWeight: 600 }} onClick={() => setActiveStep((prev) => prev - 1)} startIcon={<ArrowBack />}>Back</Button>
                )}
                <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: '45px', height: '45px', width:'115px', backgroundColor:'#012763',  marginLeft: 'auto', }} endIcon={<ArrowForward />}>
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </Box>
                     <Typography
                              gutterBottom
                              align="center"
                              sx={{ color: '#606369', fontWeight: 50, fontSize: '14px', mt: '5%' }}
                            >
                              Already registered? 
                              <Button
                                variant="text"
                                sx={{ px: 1, fontWeight: 500, textTransform: 'none', color: 'var(--pri)' }}
                                onClick={() => navigate('/login')} // Navigate to SignUp
                              >
                                Log in
                              </Button>
                            </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
      <Footer />
    </>
  );
}

export default SignUp;
