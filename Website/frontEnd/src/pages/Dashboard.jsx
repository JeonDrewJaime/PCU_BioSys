import React, { useState, useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';

import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,

  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { fetchAllUsers } from "../../APIs/adminAPI";
import {
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  LineChart, 
  Line 
} from "recharts";
import indibg from '../assets/indicatorBg.png';
import Loader from "./Loader";




const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [overallAttendanceRate, setOverallAttendanceRate] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [selectedMetric, setSelectedMetric] = useState("attendanceRate");


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loading = useDelayedLoading(fetchAttendanceData);
      // Add artificial delay (e.g., 1.5 seconds)
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };
  
    fetchData();
  }, []);
  
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in ms
      once: true,     // Animation only happens once
    });
  }, []);

  const useDelayedLoading = (fetchFn, delay = 1500) => {
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const loadData = async () => {
        await fetchFn();
        setTimeout(() => setLoading(false), delay);
      };
      loadData();
    }, [fetchFn, delay]);
  
    return loading;
  };
  
  
  const analyzeChartData = () => {
    if (chartData.length === 0) return "No data available for analysis.";
  
    const dataKey = selectedMetric === "all" ? "attendanceRate" : selectedMetric;
    const values = chartData.map((entry) => entry[dataKey]).filter(v => v != null);
  
    if (values.length === 0) return "No valid data to analyze.";
  
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const trend = values[values.length - 1] - values[0];
  
    if (selectedMetric === "all") {
      return ` Trend is ${trend >= 0 ? "upward 📈" : "downward 📉"}.`;
    } else {
      const metricLabels = {
        attendanceRate: "Attendance Rate",
        absenteeismRate: "Absenteeism Rate",
        punctualityRate: "Punctuality Rate",
        lateArrivalRate: "Late Arrival Rate",
      };
  
      const trendText = trend > 0
        ? `increased by ${trend.toFixed(2)}% 📈`
        : `decreased by ${Math.abs(trend).toFixed(2)}% 📉`;
  
      return `${metricLabels[selectedMetric]} has an average of ${average.toFixed(2)}% and ${trendText}.`;
    }
  };
  
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchAllUsers();
        let totalPresentDays = 0;
        let totalWorkingDays = 0;
        let totalAbsentDays = 0;
        let totalScheduledDays = 0;
        let totalOnTime = 0;
        let totalCheckIns = 0;
        let totalLate = 0;
        let attendanceByDate = {};
        const processedUsers = data.map((user) => {
          let presentDays = 0;
          let workingDays = 0;
          let absentDays = 0;
          let scheduledDays = 0;
          let onTimeCount = 0;
          let lateCount = 0;
          let totalCount = 0;
  
          if (user.attendance) {
            Object.entries(user.attendance).forEach(([academicYear, semesters]) => {
              Object.entries(semesters).forEach(([semester, dates]) => {
                Object.entries(dates).forEach(([date, courses]) => {
                  scheduledDays++;
                  attendanceByDate[date] = attendanceByDate[date] || {
                    date,
                    presentDays: 0,
                    absentDays: 0,
                    onTimeCount: 0,
                    lateCount: 0,
                    totalCheckIns: 0,
                  };
  
                  Object.values(courses).forEach((details) => {
                    totalCount++;
                    attendanceByDate[date].totalCheckIns++;
  
                    if (details.late_status === "On Time") {
                      onTimeCount++;
                      presentDays++;
                      totalOnTime++;
                      attendanceByDate[date].onTimeCount++;
                      attendanceByDate[date].presentDays++;
                    } else if (details.late_status === "Late") {
                      lateCount++;
                      presentDays++;
                      totalLate++;
                      attendanceByDate[date].lateCount++;
                      attendanceByDate[date].presentDays++;
                    } else if (details.late_status === "Absent") {
                      absentDays++;
                      totalAbsentDays++;
                      attendanceByDate[date].absentDays++;
                    }
                  });
                });
              });
            });
          }
  
          totalPresentDays += presentDays;
          totalWorkingDays += workingDays;
          totalScheduledDays += scheduledDays;
          totalCheckIns += totalCount;
  
          const attendanceRate = totalCount > 0 ? (onTimeCount / totalCount) * 100 : null;
  
          return { ...user, presentDays, absentDays, onTimeCount, lateCount, totalCheckIns: totalCount, attendanceRate };
        });
  
        const sortedUsers = processedUsers.sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0));
  
        setOverallAttendanceRate(
          totalScheduledDays > 0 ? (totalPresentDays / totalScheduledDays) * 100 : null
        );
  
        const attendanceMetrics = Object.values(attendanceByDate).map((entry) => ({
          date: entry.date,
          attendanceRate: totalScheduledDays > 0 ? (entry.presentDays / totalScheduledDays) * 100 : 0,
          absenteeismRate: totalScheduledDays > 0 ? (entry.absentDays / totalScheduledDays) * 100 : 0,
          punctualityRate: entry.totalCheckIns > 0 ? (entry.onTimeCount / entry.totalCheckIns) * 100 : 0,
          lateArrivalRate: entry.totalCheckIns > 0 ? (entry.lateCount / entry.totalCheckIns) * 100 : 0,
        }));
  
        setUsers(sortedUsers);
        setChartData(filterDataByTime(attendanceMetrics, timeFilter));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    getUsers();
  }, [timeFilter]);
  
  const filterDataByTime = (data, filter) => {
    const groupedData = {};
  
    data.forEach((entry) => {
      const entryDate = new Date(entry.date);
      let key;
  
      if (filter === "monthly") {
        key = entryDate.toLocaleString("default", { month: "long", year: "numeric" });
      } else if (filter === "yearly") {
        key = entryDate.getFullYear().toString();
      }
  
      if (key) {
        if (!groupedData[key]) {
          groupedData[key] = { date: key, attendanceRate: 0, absenteeismRate: 0, punctualityRate: 0, lateArrivalRate: 0, count: 0 };
        }
        groupedData[key].attendanceRate += entry.attendanceRate;
        groupedData[key].absenteeismRate += entry.absenteeismRate;
        groupedData[key].punctualityRate += entry.punctualityRate;
        groupedData[key].lateArrivalRate += entry.lateArrivalRate;
        groupedData[key].count++;
      }
    });
  
    return Object.values(groupedData)
      .map((entry) => ({
        date: entry.date,
        attendanceRate: entry.attendanceRate / entry.count,
        absenteeismRate: entry.absenteeismRate / entry.count,
        punctualityRate: entry.punctualityRate / entry.count,
        lateArrivalRate: entry.lateArrivalRate / entry.count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));  // Ensure chronological order
  };
  

  
  if (error) return <Typography color="error">Error: {error}</Typography>;


 // Filter out admins from users
const filteredUsers = users.filter(user => user.role !== "Admin");


// Top 3 Best Attendance (excluding admins)
const top3BestAttendance = [...filteredUsers]
  .sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0))
  .slice(0, 3);

  const top3HighestLateRate = [...filteredUsers]
  .map(user => ({
    ...user,
    lateRate: user.totalCheckIns > 0 ? (user.lateCount / user.totalCheckIns) * 100 : 0
  }))
  .sort((a, b) => b.lateRate - a.lateRate)
  .slice(0, 3);
// Top 3 Highest Absent Rate (excluding admins)
const top3HighestAbsentRate = [...filteredUsers]
  .map(user => ({
    ...user,
    absentRate: user.totalCheckIns > 0 ? (user.absentDays / user.totalCheckIns) * 100 : 0
  }))
  .sort((a, b) => b.absentRate - a.absentRate)
  .slice(0, 3);

  return (
    
    <div style={{ padding: "20px", }}>
   
   <Typography variant="h4" gutterBottom sx = {{color: "#041129", fontWeight: "bold", mt: -3}}>
        Key Performance Indicator
      </Typography>
      <Typography gutterBottom sx = {{color: "#041129",mt: -1, mb: 2,fontSize: "16px", mb: 4}}>
      Welcome back! Here's a quick look at your latest updates and insights. Let's get things done!
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1.8 }}>
      <Grid container spacing={2} sx={{ mb: 1.8, ml: 0.5}}>
  <Grid item xs={12} md={4} data-aos="fade-up" >
    <Card sx={{ border: "1px solid #D6D7D6", borderRadius: 4, backgroundColor: "#d4eeda", boxShadow: "none", }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#2A6534" }}>Total Present</Typography>
        <Typography variant="h4" sx={{ color: "#2A6534", fontWeight: "bold", }}>
          {users.reduce((sum, user) => sum + user.presentDays, 0)}
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} md={4} data-aos="fade-up" data-aos-delay="200">
    <Card sx={{ border: "1px solid #D6D7D6", borderRadius: 4, backgroundColor: "#fbdbdb", boxShadow: "none" }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#7A0002" }}>Total Absent</Typography>
        <Typography variant="h4" sx={{ color: "#7A0002", fontWeight: "bold", }}>
          {users.reduce((sum, user) => sum + user.absentDays, 0)}
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} md={4} data-aos="fade-up" data-aos-delay="400">
    <Card sx={{ border: "1px solid #D6D7D6", borderRadius: 4, backgroundColor: "#ffeacc", boxShadow: "none", }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#643002" }}>Total Late</Typography>
        <Typography variant="h4" sx={{ color: "#643002", fontWeight: "bold", }}>
          {users.reduce((sum, user) => sum + user.lateCount, 0)}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>

</Grid>

<Grid container spacing={2}>
  {/* Left Side - Chart Section (9/12 width) */}
  <Grid item xs={12} md={9}>
  <Box
  sx={{
    border: "1px solid #D6D7D6",
    padding: 3,
    borderRadius: 4,
    backgroundColor: "#fff",
  }}
  data-aos="zoom-in"
>

      {/* Filter & Data Type Select */}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
    
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Data Type</InputLabel>
          <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="attendanceRate">Attendance Rate</MenuItem>
            <MenuItem value="absenteeismRate">Absenteeism Rate</MenuItem>
            <MenuItem value="punctualityRate">Punctuality Rate</MenuItem>
            <MenuItem value="lateArrivalRate">Late Arrival Rate</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Chart Container */}
      <Box sx={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
  {selectedMetric === "all" ? (
    <BarChart data={chartData}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      <Bar dataKey="attendanceRate" fill="#4CAF50" name="Attendance Rate (%)" />
      <Bar dataKey="absenteeismRate" fill="#F44336" name="Absenteeism Rate (%)" />
      <Bar dataKey="punctualityRate" fill="#2196F3" name="Punctuality Rate (%)" />
      <Bar dataKey="lateArrivalRate" fill="#FFC107" name="Late Arrival Rate (%)" />
    </BarChart>
  ) : (
    <LineChart data={chartData}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      {selectedMetric === "attendanceRate" && (
        <Line type="monotone" dataKey="attendanceRate" stroke="#4CAF50" name="Attendance Rate (%)" />
      )}
      {selectedMetric === "absenteeismRate" && (
        <Line type="monotone" dataKey="absenteeismRate" stroke="#F44336" name="Absenteeism Rate (%)" />
      )}
      {selectedMetric === "punctualityRate" && (
        <Line type="monotone" dataKey="punctualityRate" stroke="#2196F3" name="Punctuality Rate (%)" />
      )}
      {selectedMetric === "lateArrivalRate" && (
        <Line type="monotone" dataKey="lateArrivalRate" stroke="#FFC107" name="Late Arrival Rate (%)" />
      )}
    </LineChart>
  )}
</ResponsiveContainer>
</Box>

    </Box>
  </Grid>

  {/* Right Side - Indicator Analysis (3/12 width) */}
  <Grid item xs={12} md={3}>
    <Box sx={{
      height: "100%",
      p: 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      border: "1px solid #D6D7D6", // Thin dark gray border   
      borderRadius: 4,
      background: `url(${indibg})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
    }}data-aos="flip-up">
      <Typography variant="h6" align="center" sx={{ fontWeight: "bold", color: "#012763",  }}>
        Indicator Analysis
      </Typography>
      <Typography variant="body1" align="center" sx= {{ color: "#041129",  }} >
        {analyzeChartData()}
      </Typography>
    </Box>
  </Grid>
</Grid>



 <Grid container spacing={2} sx={{ marginTop: -1 }}>
  <Grid item xs={12}>
    <Grid container spacing={2}>
      {/* Top 3 Best Attendance */}
      <Grid item xs={12} md={4}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1, color: "#012763" }}>
          🏅 Top 3 Best Attendance
        </Typography>
        <TableContainer component="div" sx={{ border: "1px solid #D6D7D6", borderRadius: 4, backgroundColor: "#fff" }} data-aos="fade-left">

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#d4eeda" }}>
                <TableCell sx={{ color: "#2A6534", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "#2A6534", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "#2A6534", fontWeight: "bold" }}>Attendance Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {top3BestAttendance.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.firstname} {user.lastname}</TableCell>
                  <TableCell>{user.attendanceRate?.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Top 3 Highest Absent Rate */}
      <Grid item xs={12} md={4}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1, color: "#012763" }}>
          🚨 Top 3 Highest Absent Rate
        </Typography>
        <TableContainer component="div" sx={{ border: "1px solid #D6D7D6", borderRadius: 4, backgroundColor: "#fff" }} data-aos="fade-right">

          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fbdbdb" }}>
                <TableCell sx={{ color: "#7A0002", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "#7A0002", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "#7A0002", fontWeight: "bold" }}>Absent Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {top3HighestAbsentRate.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.firstname} {user.lastname}</TableCell>
                  <TableCell>{user.absentRate?.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Top 3 Highest Late Rate */}
<Grid item xs={12} md={4}>
  <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1, color: "#012763" }}>
    ⏳ Top 3 Highest Late Rate
  </Typography>
  <TableContainer component="div" sx={{ border: "1px solid #D6D7D6", borderRadius: 4, backgroundColor: "#fff" }} data-aos="fade-left">
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#ffeacc" }}>
          <TableCell sx={{ color: "#643002", fontWeight: "bold" }}>Rank</TableCell>
          <TableCell sx={{ color: "#643002", fontWeight: "bold" }}>Name</TableCell>
          <TableCell sx={{ color: "#643002", fontWeight: "bold" }}>Late Rate</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {top3HighestLateRate.map((user, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{user.firstname} {user.lastname}</TableCell>
            <TableCell>{user.lateRate?.toFixed(2)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Grid>
    </Grid>
  </Grid>
</Grid>

    </div>
  );
};

export default Dashboard;