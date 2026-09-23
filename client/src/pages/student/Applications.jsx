import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getMyApplications } from '../../services/api';

const statusColor = {
  Applied: 'text-fog border-line',
  'Under Review': 'text-signal border-signal/40',
  Shortlisted: 'text-signal border-signal/40',
  Selected: 'text-eligible border-eligible/40',
  Rejected: 'text-blocked border-blocked/40',
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar title="My Applications" />
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <p className="text-fog">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-fog text-sm">You haven't applied to any placement drives yet.</p>
        ) : (
          <div className="border border-line bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-fog text-left">
                  <th className="px-4 py-3 font-normal">Company</th>
                  <th className="px-4 py-3 font-normal">Role</th>
                  <th className="px-4 py-3 font-normal">Match</th>
                  <th className="px-4 py-3 font-normal">Applied On</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-paper">{app.placementDriveId?.companyId?.name}</td>
                    <td className="px-4 py-3 text-paper">{app.placementDriveId?.title}</td>
                    <td className="px-4 py-3 text-signal">{app.matchPercentage}%</td>
                    <td className="px-4 py-3 text-fog">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 border ${statusColor[app.status] || 'text-fog border-line'}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
