import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getProfile, updateProfile } from '../../services/api';

const emptyProject = { name: '', description: '', technologies: '' };

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.data.profile))
      .finally(() => setLoading(false));
  }, []);

  const skillFields = [
    { key: 'programmingLanguages', label: 'Programming Languages' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'database', label: 'Database' },
    { key: 'tools', label: 'Tools' },
  ];

  const setField = (path, value) => {
    setProfile((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const setSkillList = (key, text) => {
    setField(`skills.${key}`, text.split(',').map((s) => s.trim()).filter(Boolean));
  };

  const addProject = () => {
    setProfile((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), { name: '', description: '', technologies: [] }],
    }));
  };

  const removeProject = (idx) => {
    setProfile((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }));
  };

  const updateProject = (idx, key, value) => {
    setProfile((prev) => {
      const projects = [...prev.projects];
      projects[idx] = {
        ...projects[idx],
        [key]: key === 'technologies' ? value.split(',').map((s) => s.trim()).filter(Boolean) : value,
      };
      return { ...prev, projects };
    });
  };

  const addCertification = () => {
    setProfile((prev) => ({ ...prev, certifications: [...(prev.certifications || []), { name: '' }] }));
  };

  const removeCertification = (idx) => {
    setProfile((prev) => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }));
  };

  const updateCertification = (idx, value) => {
    setProfile((prev) => {
      const certifications = [...prev.certifications];
      certifications[idx] = { name: value };
      return { ...prev, certifications };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await updateProfile({
        personalInfo: profile.personalInfo,
        education: profile.education,
        skills: profile.skills,
        projects: profile.projects,
        certifications: profile.certifications,
        socialLinks: profile.socialLinks,
      });
      setProfile(res.data.profile);
      setMessage('Profile saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <>
        <Navbar title="Profile" />
        <main className="flex-1 p-6">
          <p className="text-fog">Loading profile...</p>
        </main>
      </>
    );
  }

  const inputClass =
    'w-full bg-ink border border-line px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-signal';
  const labelClass = 'block text-sm text-fog mb-1.5';

  return (
    <>
      <Navbar title="Profile" />
      <main className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSave} className="max-w-3xl space-y-8">
          {message && (
            <div className="border border-signal/40 text-signal text-sm px-3 py-2">{message}</div>
          )}

          {/* Personal Info */}
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={profile.personalInfo?.name || ''}
                  onChange={(e) => setField('personalInfo.name', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  value={profile.personalInfo?.email || ''}
                  onChange={(e) => setField('personalInfo.email', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  className={inputClass}
                  value={profile.personalInfo?.phone || ''}
                  onChange={(e) => setField('personalInfo.phone', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Academic Info */}
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Academic Information</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Course</label>
                <input
                  className={inputClass}
                  placeholder="e.g. MCA"
                  value={profile.education?.course || ''}
                  onChange={(e) => setField('education.course', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Branch</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Computer Applications"
                  value={profile.education?.branch || ''}
                  onChange={(e) => setField('education.branch', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Graduation Year</label>
                <input
                  type="number"
                  className={inputClass}
                  value={profile.education?.graduationYear || ''}
                  onChange={(e) => setField('education.graduationYear', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className={inputClass}
                  value={profile.education?.cgpa || ''}
                  onChange={(e) => setField('education.cgpa', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>10th Percentage</label>
                <input
                  type="number"
                  className={inputClass}
                  value={profile.education?.tenthPercentage || ''}
                  onChange={(e) => setField('education.tenthPercentage', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>12th Percentage</label>
                <input
                  type="number"
                  className={inputClass}
                  value={profile.education?.twelfthPercentage || ''}
                  onChange={(e) => setField('education.twelfthPercentage', Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>Backlogs</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={profile.education?.backlogs ?? 0}
                  onChange={(e) => setField('education.backlogs', Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-1">Skills</h2>
            <p className="text-xs text-fog mb-4">Comma-separated. These power your eligibility match.</p>
            <div className="space-y-4">
              {skillFields.map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. React, Node.js"
                    value={(profile.skills?.[key] || []).join(', ')}
                    onChange={(e) => setSkillList(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="border border-line bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-paper">Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1 text-sm text-signal hover:underline"
              >
                <Plus size={14} /> Add project
              </button>
            </div>
            <div className="space-y-5">
              {(profile.projects || []).map((project, idx) => (
                <div key={idx} className="border border-line p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      className={`${inputClass} font-medium`}
                      placeholder="Project name"
                      value={project.name}
                      onChange={(e) => updateProject(idx, 'name', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="ml-3 text-fog hover:text-blocked shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                    value={project.description}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Technologies (comma-separated)"
                    value={(project.technologies || []).join(', ')}
                    onChange={(e) => updateProject(idx, 'technologies', e.target.value)}
                  />
                </div>
              ))}
              {(profile.projects || []).length === 0 && (
                <p className="text-fog text-sm">No projects added yet.</p>
              )}
            </div>
          </section>

          {/* Certifications */}
          <section className="border border-line bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-paper">Certifications</h2>
              <button
                type="button"
                onClick={addCertification}
                className="inline-flex items-center gap-1 text-sm text-signal hover:underline"
              >
                <Plus size={14} /> Add certification
              </button>
            </div>
            <div className="space-y-3">
              {(profile.certifications || []).map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    className={inputClass}
                    placeholder="Certificate name"
                    value={cert.name}
                    onChange={(e) => updateCertification(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(idx)}
                    className="text-fog hover:text-blocked shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(profile.certifications || []).length === 0 && (
                <p className="text-fog text-sm">No certifications added yet.</p>
              )}
            </div>
          </section>

          {/* Social Links */}
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Social Links</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>GitHub</label>
                <input
                  className={inputClass}
                  value={profile.socialLinks?.github || ''}
                  onChange={(e) => setField('socialLinks.github', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input
                  className={inputClass}
                  value={profile.socialLinks?.linkedin || ''}
                  onChange={(e) => setField('socialLinks.linkedin', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Portfolio</label>
                <input
                  className={inputClass}
                  value={profile.socialLinks?.portfolio || ''}
                  onChange={(e) => setField('socialLinks.portfolio', e.target.value)}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-signal text-ink font-medium px-5 py-2.5 text-sm hover:bg-signal-deep transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </main>
    </>
  );
}
