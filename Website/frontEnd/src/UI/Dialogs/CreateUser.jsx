import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, Stepper, Step, StepLabel, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useFormik } from 'formik';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../../../utils/firebase-config';
import pcubg from '../../assets/pcubg.jpg';

const steps = ['Account Details', 'Personal Information', 'Password Setup'];

const validationSchemas = [
  Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
  }),
  Yup.object({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    department: Yup.string().required('Department is required'),
  }),
  Yup.object({
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  }),
];


function CreateUser({ onClose, updatePeople }) {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [activeStep, setActiveStep] = useState(0);

  const formik = useFormik({
    initialValues: {
      email: '',
      firstname: '',
      lastname: '',
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

          await set(ref(database, `users/faculty/${user.uid}`), {
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            department: values.department,
            role: "Faculty", // Add default role
            id: user.uid // Add the user ID
          });

          // Call updatePeople with the new user data
          updatePeople({
            id: user.uid,
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            department: values.department,
            role: "Faculty",
            attendance: {} // Add empty attendance object
          });

          // Show success message and close
          Swal.fire("Success!", "User created successfully.", "success");
          onClose();
        } catch (error) {
          console.error("Error creating user:", error);
          Swal.fire("Error!", error.message, "error");
        }
      } else {
        setActiveStep((prev) => prev + 1);
      }
    },
  });

  return (
    <>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: '#041129', fontWeight: 700, letterSpacing: 1, fontSize: '30px', mb: '20px' }}>
        Create User
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: '20px' }}>
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
            <TextField fullWidth margin="normal" label="First Name" {...formik.getFieldProps('firstname')} error={formik.touched.firstname && Boolean(formik.errors.firstname)} helperText={formik.touched.firstname && formik.errors.firstname} />
            <TextField fullWidth margin="normal" label="Last Name" {...formik.getFieldProps('lastname')} error={formik.touched.lastname && Boolean(formik.errors.lastname)} helperText={formik.touched.lastname && formik.errors.lastname} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select {...formik.getFieldProps('department')} error={formik.touched.department && Boolean(formik.errors.department)}>
                <MenuItem value="Information Technology">Information Technology</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Computer Engineering">Computer Engineering</MenuItem>
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
          {activeStep > 0 && <Button variant="outlined" onClick={() => setActiveStep((prev) => prev - 1)} startIcon={<ArrowBack />}>Back</Button>}
          <Button type="submit" variant="contained" color="primary" endIcon={<ArrowForward />}>{activeStep === steps.length - 1 ? 'Submit' : 'Next'}</Button>
        </Box>
      </form>
    </>
  );
}

export default CreateUser;
