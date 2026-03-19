import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SummaryPage from "./pages/SummaryPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import ShareReport from "./pages/ShareReport";

function App() {
  return (
    <BrowserRouter>

      {/* ✅ Toast container must be inside return */}
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/share-report" element={<ShareReport />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;