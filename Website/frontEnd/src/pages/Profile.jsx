import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";

// Helper function to fetch user data
const fetchUserData = async (db, uid) => {
  const paths = [`users/faculty/${uid}`, `users/admin/${uid}`];
  for (const path of paths) {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) return snapshot.val();
  }
  throw new Error("User data not found in any expected path.");
};

// Filter and process attendance data
const processAttendanceData = (attendance, filter) => {
  if (!attendance) return [];

  const today = dayjs();
  const dataMap = new Map();

  for (const [date, classes] of Object.entries(attendance)) {
    let present = 0, late = 0, absent = 0;

    Object.values(classes).forEach(({ late_status }) => {
      if (late_status === "On Time") present++;
      if (late_status === "Late") late++;
      if (late_status === "Absent") absent++;
    });

    let periodKey;
    if (filter === "week") {
      const weekNumber = Math.ceil(dayjs(date).date() / 7);
      periodKey = `Week ${weekNumber}`;
    } else if (filter === "month") {
      if (dayjs(date).isAfter(today.subtract(30, "day"))) {
        periodKey = dayjs(date).format("MMM D");
      } else {
        continue;
      }
    } else if (filter === "year") {
      periodKey = dayjs(date).format("MMMM");
    } else {
      periodKey = date;
    }

    if (!dataMap.has(periodKey)) {
      dataMap.set(periodKey, { period: periodKey, Present: 0, Late: 0, Absent: 0 });
    }

    const entry = dataMap.get(periodKey);
    entry.Present += present;
    entry.Late += late;
    entry.Absent += absent;
  }

  return Array.from(dataMap.values());
};

// Calculate improvement (trend analysis)
const calculateImprovement = (data) => {
  return data.map((entry, index, arr) => {
    if (index === 0) return { ...entry, Improvement: null };

    const prev = arr[index - 1];
    const totalPrev = prev.Present + prev.Late + prev.Absent;
    const improvement = totalPrev > 0 ? ((entry.Present - prev.Present) / totalPrev) * 100 : 0;

    return { ...entry, Improvement: improvement.toFixed(2) };
  });
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("month");
  const [showPresent, setShowPresent] = useState(true);
  const [showLate, setShowLate] = useState(true);
  const [showAbsent, setShowAbsent] = useState(true);

  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("No authenticated user.");
        const data = await fetchUserData(db, uid);
        setUserData(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [auth, db]);

  const attendanceData = useMemo(() => {
    if (!userData?.attendance) return [];
    const processed = processAttendanceData(userData.attendance, filter);
    return calculateImprovement(processed);
  }, [userData, filter]);

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (!userData) return <Typography>Error loading user data.</Typography>;

  const { firstname, lastname, email, role, department } = userData;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#012763" }}>
        Profile - {firstname} {lastname}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography><strong>Email:</strong> {email}</Typography>
        <Typography><strong>Role:</strong> {role}</Typography>
        <Typography><strong>Department:</strong> {department}</Typography>
      </Box>

      <Typography variant="h6" sx={{ mt: 4, fontWeight: "bold", color: "#012763" }}>
        Attendance Overview
      </Typography>

      <Box sx={{ mt: 2, p: 2, border: "1px solid #D6D7D6", borderRadius: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormGroup row>
              <FormControlLabel control={<Checkbox checked={showPresent} onChange={() => setShowPresent(!showPresent)} />} label="Present" />
              <FormControlLabel control={<Checkbox checked={showLate} onChange={() => setShowLate(!showLate)} />} label="Late" />
              <FormControlLabel control={<Checkbox checked={showAbsent} onChange={() => setShowAbsent(!showAbsent)} />} label="Absent" />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ height: 300, mt: 2 }}>
          <LineChart
            dataset={attendanceData}
            xAxis={[{ scaleType: "band", dataKey: "period" }]}
            series={[
              showPresent && { dataKey: "Present", color: "#4CAF50", showMark: true },
              showLate && { dataKey: "Late", color: "#FF9800", showMark: true },
              showAbsent && { dataKey: "Absent", color: "#F44336", showMark: true },
            ].filter(Boolean)}
            height={300}
          />
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mt: 4, fontWeight: "bold", color: "#012763" }}>
        Attendance Records
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#CEE3F3" }}>
              <TableCell>Period</TableCell>
              {showPresent && <TableCell>Present</TableCell>}
              {showLate && <TableCell>Late</TableCell>}
              {showAbsent && <TableCell>Absent</TableCell>}
              <TableCell>Improvement (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map(({ period, Present, Late, Absent, Improvement }) => (
              <TableRow key={period}>
                <TableCell>{period}</TableCell>
                {showPresent && <TableCell>{Present}</TableCell>}
                {showLate && <TableCell>{Late}</TableCell>}
                {showAbsent && <TableCell>{Absent}</TableCell>}
                <TableCell>{Improvement ?? "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Profile;
