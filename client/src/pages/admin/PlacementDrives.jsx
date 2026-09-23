import { useEffect, useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getPlacements, getCompanies, createPlacement, updatePlacement, deletePlacement } from '../../services/api';

const emptyForm = {
  companyId: '',
  title: '',
  description: '',
  package: '',
  location: '',
  allowedCourses: '',
  allowedBranches: '',
  minCgpa: '',
  graduationYear: '',
  maxBacklogs: '',
  requiredSkills: '',
  preferredSkills: '',
  deadline: '',
};

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getPlacements(), getCompanies()])
      .then(([drivesRes, companiesRes]) => {
        setDrives(drivesRes.data.placements);
        setCompanies(companiesRes.data.companies);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (drive) => {
    setForm({
      companyId: drive.companyId?._id || '',
      title: drive.title,
      description: drive.description || '',
      package: drive.package || '',
      location: drive.location || '',
      allowedCourses: (drive.eligibilityCriteria?.allowedCourses || []).join(', '),
      allowedBranches: (drive.eligibilityCriteria?.allowedBranches || []).join(', '),
      minCgpa: drive.eligibilityCriteria?.minCgpa ?? '',
      graduationYear: drive.eligibilityCriteria?.graduationYear ?? '',
      maxBacklogs: drive.eligibilityCriteria?.maxBacklogs ?? '',
      requiredSkills: (drive.requiredSkills || []).join(', '),
      preferredSkills: (drive.preferredSkills || []).join(', '),
      deadline: drive.deadline ? new Date(drive.deadline).toISOString().slice(0, 10) : '',
    });
    setEditingId(drive._id);
    setError('');
    setModalOpen(true);
  };

  const csv = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      companyId: form.companyId,
      title: form.title,
      description: form.description,
      package: form.package,
      location: form.location,
      eligibilityCriteria: {
        allowedCourses: csv(form.allowedCourses),
        allowedBranches: csv(form.allowedBranches),
        minCgpa: form.minCgpa ? Number(form.minCgpa) : 0,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        maxBacklogs: form.maxBacklogs ? Number(form.maxBacklogs) : 0,
      },
      requiredSkills: csv(form.requiredSkills),
      preferredSkills: csv(form.preferredSkills),
      deadline: form.deadline,
    };

    try {
      if (editingId) {
        await updatePlacement(editingId, payload);
      } else {
        await createPlacement(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save placement drive.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this placement drive?')) return;
    try {
      await deletePlacement(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const inputClass =
    'w-full bg-ink border border-line px-3 py-2 text-paper text-sm focus:outline-none focus:border-signal';
  const labelClass = 'block text-xs text-fog mb-1';

  return (
    <>
      <Navbar title="Placement Drives" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-signal text-ink font-medium px-4 py-2 text-sm hover:bg-signal-deep transition-colors"
          >
            <Plus size={16} /> Create Drive
          </button>
        </div>

        {loading ? (
          <p className="text-fog">Loading drives...</p>
        ) : (
          <div className="border border-line bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-fog text-left">
                  <th className="px-4 py-3 font-normal">Company</th>
                  <th className="px-4 py-3 font-normal">Role</th>
                  <th className="px-4 py-3 font-normal">Min CGPA</th>
                  <th className="px-4 py-3 font-normal">Applicants</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((d) => (
                  <tr key={d._id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-paper">{d.companyId?.name}</td>
                    <td className="px-4 py-3 text-paper">{d.title}</td>
                    <td className="px-4 py-3 text-fog">{d.eligibilityCriteria?.minCgpa}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/applications?drive=${d._id}`}
                        className="inline-flex items-center gap-1 text-signal hover:underline"
                      >
                        <Users size={13} /> {d.applicantCount ?? 0}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 border ${
                          d.status === 'active' ? 'border-eligible/40 text-eligible' : 'border-line text-fog'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <button onClick={() => openEdit(d)} className="text-signal hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(d._id)} className="text-blocked hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-surface border border-line w-full max-w-2xl p-6 my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-paper">
                  {editingId ? 'Edit Placement Drive' : 'Create Placement Drive'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-fog hover:text-paper">
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="mb-4 border border-blocked/40 text-blocked text-sm px-3 py-2">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Company</label>
                    <select
                      required
                      className={inputClass}
                      value={form.companyId}
                      onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    >
                      <option value="">Select company</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input
                      required
                      className={inputClass}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Package</label>
                    <input
                      placeholder="7 LPA"
                      className={inputClass}
                      value={form.package}
                      onChange={(e) => setForm({ ...form, package: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      className={inputClass}
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Deadline</label>
                    <input
                      type="date"
                      required
                      className={inputClass}
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t border-line pt-4">
                  <p className="text-sm text-paper mb-3">Eligibility Criteria</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Allowed Courses (comma-separated)</label>
                      <input
                        placeholder="MCA, BTech"
                        className={inputClass}
                        value={form.allowedCourses}
                        onChange={(e) => setForm({ ...form, allowedCourses: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Allowed Branches (comma-separated)</label>
                      <input
                        className={inputClass}
                        value={form.allowedBranches}
                        onChange={(e) => setForm({ ...form, allowedBranches: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Minimum CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={form.minCgpa}
                        onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Graduation Year</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={form.graduationYear}
                        onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Max Backlogs Allowed</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={form.maxBacklogs}
                        onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-line pt-4">
                  <p className="text-sm text-paper mb-3">Skills</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Required Skills (comma-separated)</label>
                      <input
                        placeholder="Java, DSA, SQL, Git, React"
                        className={inputClass}
                        value={form.requiredSkills}
                        onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Skills (comma-separated)</label>
                      <input
                        placeholder="Node.js, MongoDB"
                        className={inputClass}
                        value={form.preferredSkills}
                        onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-signal text-ink font-medium py-2.5 text-sm hover:bg-signal-deep transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Drive' : 'Create Drive'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
