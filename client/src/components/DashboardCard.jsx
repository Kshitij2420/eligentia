export default function DashboardCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="border border-line bg-surface p-5 flex items-start justify-between">
      <div>
        <p className="text-fog text-sm">{label}</p>
        <p className={`mt-2 font-display text-3xl ${accent ? 'text-signal' : 'text-paper'}`}>{value}</p>
      </div>
      {Icon && (
        <div className="p-2 border border-line text-fog">
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
