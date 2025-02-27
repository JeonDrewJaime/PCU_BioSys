import React, { useState, useEffect } from "react";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [overallAttendanceRate, setOverallAttendanceRate] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [selectedMetric, setSelectedMetric] = useState("attendanceRate");

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
            Object.entries(user.attendance).forEach(([date, courses]) => {
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
    const now = new Date();
    const groupedData = {};

    data.forEach((entry) => {
      const entryDate = new Date(entry.date);
      let key;

      if (filter === "weekly") {
        if (entryDate >= new Date(now.setDate(now.getDate() - 7))) {
          key = entry.date;
        }
      } else if (filter === "monthly") {
        key = entryDate.toLocaleString("default", { month: "long" });
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

    return Object.values(groupedData).map((entry) => ({
      date: entry.date,
      attendanceRate: entry.attendanceRate / entry.count,
      absenteeismRate: entry.absenteeismRate / entry.count,
      punctualityRate: entry.punctualityRate / entry.count,
      lateArrivalRate: entry.lateArrivalRate / entry.count,
    }));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <div style={{ padding: "20px" }}>
   
   <Typography variant="h4" gutterBottom>
        Key Performance Indicator
      </Typography>
<Grid container>
<Grid container spacing={2} sx = {{p:5}} >
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h6">Total Present</Typography>
        <Typography variant="h4">{users.reduce((sum, user) => sum + user.presentDays, 0)}</Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h6">Total Absent</Typography>
        <Typography variant="h4">{users.reduce((sum, user) => sum + user.absentDays, 0)}</Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h6">Total Late</Typography>
        <Typography variant="h4">{users.reduce((sum, user) => sum + user.lateCount, 0)}</Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>

</Grid>

<FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
        <InputLabel>Filter</InputLabel>
        <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ marginBottom: 2, minWidth: 160, marginLeft: 2 }}>
  <InputLabel>Data Type</InputLabel>
  <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
    <MenuItem value="all">All</MenuItem>
    <MenuItem value="attendanceRate">Attendance Rate</MenuItem>
    <MenuItem value="absenteeismRate">Absenteeism Rate</MenuItem>
    <MenuItem value="punctualityRate">Punctuality Rate</MenuItem>
    <MenuItem value="lateArrivalRate">Late Arrival Rate</MenuItem>
  </Select>
</FormControl>
<Grid container spacing={2}>




  <Grid item xs={12} md={8}>
    <Box sx={{ height: 300, marginBottom: 4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {(selectedMetric === "all" || selectedMetric === "attendanceRate") && (
            <Line type="monotone" dataKey="attendanceRate" stroke="#4CAF50" name="Attendance Rate (%)" />
          )}
          {(selectedMetric === "all" || selectedMetric === "absenteeismRate") && (
            <Line type="monotone" dataKey="absenteeismRate" stroke="#F44336" name="Absenteeism Rate (%)" />
          )}
          {(selectedMetric === "all" || selectedMetric === "punctualityRate") && (
            <Line type="monotone" dataKey="punctualityRate" stroke="#2196F3" name="Punctuality Rate (%)" />
          )}
          {(selectedMetric === "all" || selectedMetric === "lateArrivalRate") && (
            <Line type="monotone" dataKey="lateArrivalRate" stroke="#FFC107" name="Late Arrival Rate (%)" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </Grid>



  <Grid item xs={12} md={4}>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Attendance Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{user.firstname} {user.lastname}</TableCell>
              
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.attendanceRate !== null ? `${user.attendanceRate.toFixed(2)}%` : "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Grid>
</Grid>

    </div>
  );
};

export default Dashboard;
