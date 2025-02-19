import React, { useState, useEffect } from "react";
import { database, ref, get } from "../../utils/firebase-config"; // Import Firebase config
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  TableSortLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

function People() {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("firstname");
  const [departmentFilter, setDepartmentFilter] = useState("");

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

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedPeople = [...people].sort((a, b) => {
    if (order === "asc") {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const filteredPeople = sortedPeople.filter(
    (person) =>
      (person.firstname.toLowerCase().includes(search.toLowerCase()) ||
        person.email.toLowerCase().includes(search.toLowerCase())) &&
      (departmentFilter ? person.department === departmentFilter : true)
  );

  return (
    <Paper sx={{ padding: 2 }}>
      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Information Technology">Information Technology</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />}>
          Add
        </Button>
      </div>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel onClick={() => handleSort("firstname")}>
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel onClick={() => handleSort("department")}>
                  Department
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPeople.map((person) => (
              <TableRow key={person.id}>
                <TableCell>{`${person.firstname} ${person.lastname}`}</TableCell>
                <TableCell>{person.department}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredPeople.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default People;
