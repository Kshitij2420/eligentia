import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Briefcase, ClipboardList, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import MatchScore from '../../components/MatchScore';
import { useAuth } from '../../context/AuthContext';
import { getPlacements, getMyApplications, getReadiness } from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlacements(), getMyApplications(), getReadiness()])
      .then(([jobsRes, appsRes, readinessRes]) => {
        setJobs(jobsRes.data.placements);
        setApplications(appsRes.data.applications);
        setReadiness(readinessRes.data.readiness);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgMatch =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + (j.matchPercentage || 0), 0) / jobs.length)
      : 0;

  const recommended = [...jobs].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)).slice(0, 3);

  return (
    <>
      <Navbar title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}`} />
      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        {loading ? (
          <p className="text-fog">Loading your dashboard...</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-line bg-surface p-5 flex items-center gap-4">
                <MatchScore value={readiness?.overall || 0} size={72} />
                <div>
                  <p className="text-fog text-sm">Placement Readiness</p>
                  <p className="text-xs text-fog mt-1">Overall preparedness score</p>
                </div>
              </div>
              <DashboardCard label="Available Jobs" value={jobs.length} icon={Briefcase} />
              <DashboardCard label="Applications" value={applications.length} icon={ClipboardList} />
              <DashboardCard label="Average Match" value={`${avgMatch}%`} icon={TrendingUp} accent />
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-paper">Recommended For You</h2>
                <Link to="/student/jobs" className="text-sm text-signal hover:underline">
                  View all jobs
                </Link>
              </div>
              {recommended.length === 0 ? (
                <p className="text-fog text-sm">No placement drives available right now.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {recommended.map((job) => (
                    <Link
                      key={job._id}
                      to={`/student/jobs/${job._id}`}
                      className="border border-line bg-surface p-5 hover:border-signal/50 transition-colors"
                    >
                      <p className="text-fog text-sm">{job.company?.name}</p>
                      <h3 className="font-display text-base text-paper mt-0.5">{job.title}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span
                          className={`text-xs px-2 py-0.5 border ${
                            job.eligibilityStatus === 'eligible'
                              ? 'border-eligible/40 text-eligible'
                              : 'border-blocked/40 text-blocked'
                          }`}
                        >
                          {job.eligibilityStatus === 'eligible' ? 'Eligible' : 'Not Eligible'}
                        </span>
                        <span className="font-display text-signal text-lg">{job.matchPercentage}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-lg text-paper mb-4">Recent Applications</h2>
              {applications.length === 0 ? (
                <p className="text-fog text-sm">You haven't applied to any placement drives yet.</p>
              ) : (
                <div className="border border-line bg-surface overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line text-fog text-left">
                        <th className="px-4 py-3 font-normal">Company</th>
                        <th className="px-4 py-3 font-normal">Role</th>
                        <th className="px-4 py-3 font-normal">Match</th>
                        <th className="px-4 py-3 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app._id} className="border-b border-line last:border-0">
                          <td className="px-4 py-3 text-paper">{app.placementDriveId?.companyId?.name}</td>
                          <td className="px-4 py-3 text-paper">{app.placementDriveId?.title}</td>
                          <td className="px-4 py-3 text-signal">{app.matchPercentage}%</td>
                          <td className="px-4 py-3 text-fog">{app.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
