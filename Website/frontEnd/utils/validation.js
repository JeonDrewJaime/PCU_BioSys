import * as Yup from 'yup';

export const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  firstname: Yup.string().required('First name is required'),
  lastname: Yup.string().required('Last name is required'),
  department: Yup.string().required('Department is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});


export const isValidColumn = (rows, users) => {
  if (rows.length < 2) return false;

  const yearPattern = /^\d{4}-\d{4}$/; // Matches format YYYY-YYYY
  const validSemesters = ["1st Sem", "2nd Sem"];
  const numberPattern = /^\d+$/; // Matches numbers only
  const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/; // Matches HH:mm AM/PM
  const allowedDays = ["M", "T", "W", "TH", "F", "S"]; // Allowed day values
  const specialCharPattern = /^[a-zA-Z0-9\s]+$/; // No special characters allowed (only letters, numbers, spaces)

  // Validate first column (Academic Year and Semester)
  const isFirstColumnValid =
      yearPattern.test(rows[0][0]) && validSemesters.includes(rows[1][0]);

  // Validate 5th column (index 4) - Must contain only numbers
  const isFifthColumnValid = rows.slice(3).every(row =>
      numberPattern.test(row[4]?.toString().trim()) // Ensures only numeric values
  );

  // Validate assigned users in column 10 (index 9)
  const isAllUsersValid = rows.slice(3).every(row =>
      users.some(user => `${user.firstname} ${user.lastname}` === row[9])
  );

  // Validate 6th column (index 5) - Must be a valid day
  const isDayColumnValid = rows.slice(3).every(row =>
      allowedDays.includes(row[5]?.toString().trim().toUpperCase())
  );

  // Validate STIME (7th column - index 6) and ETIME (8th column - index 7)
  const isSTIMEValid = rows.slice(3).every(row =>
      timePattern.test(row[6]?.toString().trim())
  );
  const isETIMEValid = rows.slice(3).every(row =>
      timePattern.test(row[7]?.toString().trim())
  );

  // Ensure STIME is before ETIME
  const isTimeOrderValid = rows.slice(3).every(row => {
      const startTime = row[6]?.toString().trim();
      const endTime = row[7]?.toString().trim();

      if (!startTime || !endTime || !timePattern.test(startTime) || !timePattern.test(endTime)) {
          return false; // Invalid format already caught
      }

      // Convert time to Date object for proper comparison
      const parseTime = timeStr => {
          const [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);
          if (modifier === "PM" && hours !== 12) hours += 12;
          if (modifier === "AM" && hours === 12) hours = 0;
          return new Date(1970, 0, 1, hours, minutes); // Arbitrary date, only time matters
      };

      return parseTime(startTime) < parseTime(endTime); // STIME must be before ETIME
  });

  // Validate Columns 1,2,3,4,9 (No Special Characters)
  const isSpecialCharValid = rows.slice(3).every(row =>
      [row[0], row[1], row[2], row[3], row[8]].every(value =>
          specialCharPattern.test(value?.toString().trim())
      )
  );

  return (
      isFirstColumnValid &&
      isFifthColumnValid &&
      isAllUsersValid &&
      isDayColumnValid &&
      isSTIMEValid &&
      isETIMEValid &&
      isTimeOrderValid &&
      isSpecialCharValid // Ensure no special characters in specific columns
  );
};




