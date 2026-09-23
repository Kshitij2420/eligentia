import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/api';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getNotifications()
      .then((res) => setUnread(res.data.unreadCount))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifPath = user?.role === 'admin' ? '/admin/dashboard' : '/student/notifications';

  return (
    <header className="h-16 border-b border-line bg-surface flex items-center justify-between px-6">
      <h1 className="font-display text-lg text-paper">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(notifPath)}
          className="relative p-2 text-fog hover:text-paper transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-signal text-ink text-[10px] font-semibold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <div className="text-right hidden sm:block">
          <p className="text-sm text-paper leading-none">{user?.name}</p>
          <p className="text-xs text-fog mt-1 capitalize">{user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-fog hover:text-blocked transition-colors"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
