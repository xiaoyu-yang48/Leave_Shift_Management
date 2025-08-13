import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';

import WorkHome from './pages/WorkHome';
import ShiftSwap from './pages/ShiftSwap';
import Availability from './pages/Availability';
import Leave from './pages/Leave';
import Overtime from './pages/Overtime';
import RequestStatus from './pages/RequestStatus';

import AdminHome from './pages/AdminHome';
import AdminShift from './pages/AdminShift';
import AdminLeave from './pages/AdminLeave'; 
import AdminOvertime from './pages/AdminOvertime';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        {/* employee pages */}
        <Route path="/home" element={<WorkHome />} />
        <Route path="/shiftswap/:shiftId" element={<ShiftSwap />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/overtime" element={<Overtime />} />
        <Route path="/request_status" element={<RequestStatus />} />

        {/* admin pages */} 
        <Route path="/admin_home" element={<AdminHome />} />
        <Route path="/admin_shift" element={<AdminShift />} />
        <Route path="/admin_leave" element={<AdminLeave />} />
        <Route path="/admin_overtime" element={<AdminOvertime />} />

      </Routes>
    </Router>
  );
}

export default App;
