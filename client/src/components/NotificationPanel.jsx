import { Bell, CheckCircle2, Briefcase, Info } from 'lucide-react';

const iconFor = (type) => {
  switch (type) {
    case 'new_job':
      return Briefcase;
    case 'status_update':
      return CheckCircle2;
    case 'match_ready':
      return Bell;
    default:
      return Info;
  }
};

export default function NotificationPanel({ notifications = [], onMarkRead }) {
  if (notifications.length === 0) {
    return <p className="text-fog text-sm py-8 text-center">No notifications yet.</p>;
  }

  return (
    <div className="divide-y divide-line border border-line bg-surface">
      {notifications.map((n) => {
        const Icon = iconFor(n.type);
        return (
          <div
            key={n._id}
            className={`flex items-start gap-3 p-4 ${!n.read ? 'bg-raised/40' : ''}`}
          >
            <div className="p-2 border border-line text-signal shrink-0">
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-paper">{n.title}</p>
              <p className="text-sm text-fog mt-0.5">{n.message}</p>
              <p className="text-xs text-fog mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && (
              <button
                onClick={() => onMarkRead(n._id)}
                className="text-xs text-signal hover:underline shrink-0"
              >
                Mark read
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
