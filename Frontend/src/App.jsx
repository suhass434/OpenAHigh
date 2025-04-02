import { Routes,Route } from "react-router";
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
import Calendar  from "./Components/Dashboard/Calendar"

function App() {
  return (
    <ThemeProvider>
    <>
       <Navbar/>
        <Routes >
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/otp" element={<OTP/>} />
        <Route path="/dashboard" element={<Dashboard/>}>
    <Route path="overview" element={<Overview />} />
    <Route path="projects" element={<Projects />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="calendar" element={<Calendar />} />
    <Route path="messages" element={<Messages />} />
    <Route path="settings" element={<Settings />} />
  </Route>
        </Routes>
    </>
    </ThemeProvider>
  );
}

export default App;
