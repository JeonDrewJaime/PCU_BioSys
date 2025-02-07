import { useEffect } from "react";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { app } from "../utils/firebase-config";
import HomeNavbar from "./components/HomeNavbar";
import DashboardNavbar from "./components/DashboardNavbar";

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
    <>
      <HomeNavbar/>
      
    </>
  );
}

export default App;
