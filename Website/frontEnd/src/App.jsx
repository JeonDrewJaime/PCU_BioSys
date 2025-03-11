import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase-config";
import HomeNavbar from "./components/HomeNavbar";
import DashboardNavbar from "./components/DashboardNavbar";
import Login from "./pages/Login";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../utils/theme";
import "../fonts.css";

// ✅ Import React Query Dependencies
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Initialize Query Client
const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or splash screen
  }

  return (
    <ThemeProvider theme={theme}>
      {/* ✅ Wrap your entire application with QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<HomeNavbar />} />
            <Route
              path="/dashboard"
              element={user ? <DashboardNavbar /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <HomeNavbar />}
            />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
