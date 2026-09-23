import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getAllApplications, updateApplicationStatus } from '../../services/api';

const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'];

const statusColor = {
  Applied: 'text-fog border-line',
  'Under Review': 'text-signal border-signal/40',
  Shortlisted: 'text-signal border-signal/40',
  Selected: 'text-eligible border-eligible/40',
  Rejected: 'text-blocked border-blocked/40',
};

export default function Applications() {
  const [searchParams] = useSearchParams();
  const driveFilter = searchParams.get('drive');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    getAllApplications(driveFilter)
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveFilter]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, status);
      load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar title="Applications" />
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <p className="text-fog">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-fog text-sm">No applications found.</p>
        ) : (
          <div className="border border-line bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-fog text-left">
                  <th className="px-4 py-3 font-normal">Student</th>
                  <th className="px-4 py-3 font-normal">Job</th>
                  <th className="px-4 py-3 font-normal">Match</th>
                  <th className="px-4 py-3 font-normal">Eligibility</th>
                  <th className="px-4 py-3 font-normal">Missing Skills</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-paper">{app.studentId?.name}</p>
                      <p className="text-xs text-fog">{app.studentId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-paper">{app.placementDriveId?.title}</p>
                      <p className="text-xs text-fog">{app.placementDriveId?.companyId?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-signal">{app.matchPercentage}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 border ${
                          app.eligibilityStatus === 'eligible'
                            ? 'border-eligible/40 text-eligible'
                            : 'border-blocked/40 text-blocked'
                        }`}
                      >
                        {app.eligibilityStatus === 'eligible' ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fog text-xs max-w-[160px] truncate">
                      {app.missingSkills?.join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`bg-ink border px-2 py-1 text-xs focus:outline-none ${statusColor[app.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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
