import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Resume from './pages/student/Resume';
import Jobs from './pages/student/Jobs';
import JobDetails from './pages/student/JobDetails';
import Applications from './pages/student/Applications';
import Notifications from './pages/student/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Companies from './pages/admin/Companies';
import PlacementDrives from './pages/admin/PlacementDrives';
import AdminApplications from './pages/admin/Applications';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/resume" element={<Resume />} />
        <Route path="/student/jobs" element={<Jobs />} />
        <Route path="/student/jobs/:id" element={<JobDetails />} />
        <Route path="/student/applications" element={<Applications />} />
        <Route path="/student/notifications" element={<Notifications />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/companies" element={<Companies />} />
        <Route path="/admin/drives" element={<PlacementDrives />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
