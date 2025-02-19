import React, { useState, useEffect } from "react";
import { database, ref, get } from "../../utils/firebase-config";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Chip,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

function People() {
  const [people, setPeople] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const peopleRef = ref(database, "users/faculty");
      try {
        const snapshot = await get(peopleRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersList = Object.keys(usersData).map((key) => ({
            id: key,
            ...usersData[key],
          }));
          setPeople(usersList);
        } else {
          setPeople([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleRow = async (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: prev[id] ? null : { loading: true, data: null },
    }));

    if (!expandedRows[id]) {
      const attendanceRef = ref(database, `users/faculty/${id}/attendance`);
      try {
        const snapshot = await get(attendanceRef);
        setExpandedRows((prev) => ({
          ...prev,
          [id]: { loading: false, data: snapshot.exists() ? snapshot.val() : {} },
        }));
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    }
  };

  const toggleDate = async (personId, date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [`${personId}-${date}`]: prev[`${personId}-${date}`] ? null : { loading: true, data: null },
    }));

    if (!expandedDates[`${personId}-${date}`]) {
      const attendanceDetailRef = ref(database, `users/faculty/${personId}/attendance/${date}`);
      try {
        const snapshot = await get(attendanceDetailRef);
        setExpandedDates((prev) => ({
          ...prev,
          [`${personId}-${date}`]: { loading: false, data: snapshot.exists() ? snapshot.val() : {} },
        }));
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      }
    }
  };

  const getStatusChip = (status) => {
    let color = "default"; // Default color

    switch (status?.toLowerCase()) {
      case "on time":
        color = "success"; // Green
        break;
      case "late":
        color = "warning"; // Yellow
        break;
      case "absent":
        color = "error"; // Red
        break;
      default:
        color = "default"; // Grey for unknown values
    }

    return <Chip label={status} color={color} variant="outlined" />;
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((person) => (
              <React.Fragment key={person.id}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => toggleRow(person.id)}>
                      {expandedRows[person.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{`${person.firstname} ${person.lastname}`}</TableCell>
                  <TableCell>{person.department}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>{person.role}</TableCell>
                </TableRow>
                {expandedRows[person.id] && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Collapse in timeout="auto" unmountOnExit>
                        <Box>
                          <strong>Attendance Dates:</strong>
                          {Object.keys(expandedRows[person.id].data || {}).map((date) => (
                            <Box key={date}>
                              <IconButton onClick={() => toggleDate(person.id, date)}>
                                {expandedDates[`${person.id}-${date}`] ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                              {date}
                              <Collapse in={!!expandedDates[`${person.id}-${date}`]} timeout="auto" unmountOnExit>
                                <Box sx={{ marginLeft: 4 }}>
                                  <TableContainer component={Paper}>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Course</TableCell>
                                          <TableCell>Time In</TableCell>
                                          <TableCell>Time Out</TableCell>
                                          <TableCell>Status</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {expandedDates[`${person.id}-${date}`]?.data &&
                                          Object.entries(expandedDates[`${person.id}-${date}`].data).map(
                                            ([course, details]) => (
                                              <TableRow key={course}>
                                                <TableCell>{course}</TableCell>
                                                <TableCell>{details.time_in}</TableCell>
                                                <TableCell>{details.time_out}</TableCell>
                                                <TableCell>{getStatusChip(details.late_status)}</TableCell>
                                              </TableRow>
                                            )
                                          )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              </Collapse>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default People;
