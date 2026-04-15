import React from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

function Layout({ children, onReminderClick }) {
  const location = useLocation();
  const meeting_id = location.state?.meeting_id;

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar
        meeting_id={meeting_id}
        user_name={user?.name}
        onReminderClick={onReminderClick}
      />
      {children}
    </>
  );
}

export default Layout;