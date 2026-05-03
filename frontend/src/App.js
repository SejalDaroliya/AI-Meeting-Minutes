import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Profile from "./pages/ProfilePage.js";
import Loader from "./components/Loader";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SummaryPage from "./pages/SummaryPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import ShareReport from "./pages/ShareReport";
import { useLoader } from "./context/LoaderContext";
import Layout from "./components/Layout";
import MeetingsPage from "./pages/Meetings";
import RemindersPage from "./pages/ReminderPage";
import ActionItemsPage from "./pages/ActionItemsPage";
import LiveRecording from "./components/LiveRecording";

function App() {
  const { loading } = useLoader();

  return (
    <BrowserRouter>
      {loading && <Loader />}
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/summary"
          element={
            <Layout>
              <SummaryPage />
            </Layout>
          }
        />

        <Route
          path="/share-report"
          element={
            <Layout>
              <ShareReport />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

        <Route
          path="/meetings"
          element={
            <Layout>
              <MeetingsPage />
            </Layout>
          }
        />

        <Route
          path="/reminders"
          element={
            <Layout>
              <RemindersPage />
            </Layout>
          }
        />

        <Route
          path="/actions"
          element={
            <Layout>
              <ActionItemsPage />
            </Layout>
          }
        />

        <Route
          path="/live-recording"
          element={
            <Layout>
              <LiveRecording />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;