import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import NotificationPanel from '../../components/NotificationPanel';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getNotifications()
      .then((res) => setNotifications(res.data.notifications))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    load();
  };

  return (
    <>
      <Navbar title="Notifications" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-paper">All Notifications</h2>
            {notifications.some((n) => !n.read) && (
              <button onClick={handleMarkAllRead} className="text-sm text-signal hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-fog">Loading...</p>
          ) : (
            <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} />
          )}
        </div>
      </main>
    </>
  );
}
