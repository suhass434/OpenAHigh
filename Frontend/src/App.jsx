import React from "react"
import { Routes, Route } from "react-router-dom"
import "./App.css";
import Home from "./Pages/Home";
import Navbar from "./Components/Common/Navbar";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ThemeProvider from "./Components/ThemeProvider";
import OTP from "./Pages/OTP"
import Dashboard from "./Pages/Dashboard"
import Overview from "./Components/Dashboard/Overview"
import Projects from "./Components/Dashboard/Projects"
import Tasks from "./Components/Dashboard/Tasks"
import Messages from "./Components/Dashboard/Messages"
import Settings from "./Components/Dashboard/Settings"
import Calendar from "./Components/Dashboard/Calendar"
import PDFs from "./Components/Dashboard/PDFs"
import Task1MetadataExtraction from './Components/Tasks/Task1MetadataExtraction';
import Task2SoftwareCompatibility from './Components/Tasks/Task2SoftwareCompatibility';
import Task3ChangeNotice from './Components/Tasks/Task3ChangeNotice';
import ChatInterface from './Components/ChatInterface';
function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="overview" element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pdfs" element={<PDFs />} />
          <Route path="task1" element={<Task1MetadataExtraction />} />
          <Route path="task2" element={<Task2SoftwareCompatibility />} />
          <Route path="task3" element={<Task3ChangeNotice />} />
          <Route path="chat" element={<ChatInterface />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
