import React, {useState} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader  from "./components/Loader";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SummaryPage from "./pages/SummaryPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import ShareReport from "./pages/ShareReport";
import { useLoader } from "./context/LoaderContext";
import Layout from "./components/Layout";
import ReminderModal from "./components/ReminderModal";

function App() {
  const { loading } = useLoader();
  const [showReminder, setShowReminder] = useState(false);
  return (
    <BrowserRouter>
      { loading && <Loader />}
      {/* ✅ Toast container must be inside return */}
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <Layout  onReminderClick={() => setShowReminder(true)}>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/summary"
          element={
            <Layout  onReminderClick={() => setShowReminder(true)}>
              <SummaryPage />
            </Layout>
          }
        />

        <Route
          path="/share-report"
          element={
            <Layout  onReminderClick={() => setShowReminder(true)}>
              <ShareReport />
            </Layout>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />}/>
      </Routes>
       {/* GLOBAL MODAL */}
      <ReminderModal
        isOpen={showReminder}
        onClose={() => setShowReminder(false)}
        onSave={(data) => {
          console.log("Reminder saved:", data);
          setShowReminder(false);
        }}
        />

    </BrowserRouter>
  );
}

export default App;