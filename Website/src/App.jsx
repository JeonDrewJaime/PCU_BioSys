import { useEffect } from "react";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { app } from "../utils/firebase-config";
import HomeNavbar from "./components/HomeNavbar";
import DashboardNavbar from "./components/DashboardNavbar";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../utils/theme"
import '../fonts.css';

function App() {
  useEffect(() => {
    const db = getDatabase(app);
    // Write data to test the connection
    set(ref(db, "test_connection/"), {
      status: "Firebase connection successful!"
    });

    // Read the data back
    const testRef = ref(db, "test_connection/status");
    onValue(testRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Test Data:", data);
    });
  }, []);

  return (
   // <ThemeProvider theme={theme}>
      <DashboardNavbar />
    //</ThemeProvider>
  );
}

export default App;
