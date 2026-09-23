import { NavLink } from 'react-router-dom';
import { LayoutGrid, User, FileText, Briefcase, ClipboardList, Bell, Building2, Users, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/resume', label: 'Resume', icon: FileText },
  { to: '/student/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/student/applications', label: 'Applications', icon: ClipboardList },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
  { to: '/admin/drives', label: 'Placement Drives', icon: Briefcase },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-60 shrink-0 border-r border-line bg-surface hidden md:flex flex-col">
      <div className="px-5 py-6 border-b border-line">
        <div className="flex items-center gap-2">
          <Target className="text-signal" size={22} />
          <span className="font-display text-xl tracking-tight">ELIGENTIA</span>
        </div>
        <p className="text-xs text-fog mt-1">Placement Intelligence</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-raised text-signal border-l-2 border-signal' : 'text-fog hover:text-paper border-l-2 border-transparent'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
