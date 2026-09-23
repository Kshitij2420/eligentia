import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getAdminStudents } from '../../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStudents()
      .then((res) => setStudents(res.data.students))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar title="Students" />
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <p className="text-fog">Loading students...</p>
        ) : (
          <div className="border border-line bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-fog text-left">
                  <th className="px-4 py-3 font-normal">Name</th>
                  <th className="px-4 py-3 font-normal">Email</th>
                  <th className="px-4 py-3 font-normal">Course</th>
                  <th className="px-4 py-3 font-normal">CGPA</th>
                  <th className="px-4 py-3 font-normal">Skills</th>
                  <th className="px-4 py-3 font-normal">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-paper">{s.name}</td>
                    <td className="px-4 py-3 text-fog">{s.email}</td>
                    <td className="px-4 py-3 text-paper">{s.course}</td>
                    <td className="px-4 py-3 text-paper">{s.cgpa}</td>
                    <td className="px-4 py-3 text-fog">{s.skillCount} skills</td>
                    <td className="px-4 py-3 text-fog">{new Date(s.joinedAt).toLocaleDateString()}</td>
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
