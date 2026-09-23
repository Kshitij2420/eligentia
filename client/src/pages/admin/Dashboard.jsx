import { useEffect, useState } from 'react';
import { Users, Building2, Briefcase, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import { getAdminDashboard } from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <>
        <Navbar title="Admin Dashboard" />
        <main className="flex-1 p-6">
          <p className="text-fog">Loading dashboard...</p>
        </main>
      </>
    );
  }

  const statusData = Object.entries(data.statusBreakdown).map(([status, count]) => ({ status, count }));
  const skillsData = data.commonMissingSkills.map((s) => ({ skill: s.skill, count: s.count }));

  return (
    <>
      <Navbar title="Admin Dashboard" />
      <main className="flex-1 p-6 overflow-y-auto space-y-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard label="Total Students" value={data.stats.totalStudents} icon={Users} />
          <DashboardCard label="Companies" value={data.stats.totalCompanies} icon={Building2} />
          <DashboardCard label="Active Jobs" value={data.stats.activeJobs} icon={Briefcase} />
          <DashboardCard label="Applications" value={data.stats.totalApplications} icon={ClipboardList} accent />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Application Status</h2>
            {statusData.length === 0 ? (
              <p className="text-fog text-sm">No applications yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252E42" />
                  <XAxis dataKey="status" stroke="#8891A5" fontSize={12} />
                  <YAxis stroke="#8891A5" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#131826', border: '1px solid #252E42', color: '#EDEFF4' }}
                  />
                  <Bar dataKey="count" fill="#F2B705" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Most Common Missing Skills</h2>
            {skillsData.length === 0 ? (
              <p className="text-fog text-sm">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={skillsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#252E42" />
                  <XAxis type="number" stroke="#8891A5" fontSize={12} allowDecimals={false} />
                  <YAxis dataKey="skill" type="category" stroke="#8891A5" fontSize={12} width={90} />
                  <Tooltip
                    contentStyle={{ background: '#131826', border: '1px solid #252E42', color: '#EDEFF4' }}
                  />
                  <Bar dataKey="count" fill="#FB7185" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
