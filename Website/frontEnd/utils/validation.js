import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  firstname: Yup.string().required('First name is required'),
  lastname: Yup.string().required('Last name is required'),
  department: Yup.string().required('Department is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default validationSchema;
