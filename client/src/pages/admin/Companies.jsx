import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../../services/api';

const emptyForm = { name: '', industry: '', description: '', website: '' };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    getCompanies()
      .then((res) => setCompanies(res.data.companies))
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

  const openEdit = (company) => {
    setForm({
      name: company.name,
      industry: company.industry,
      description: company.description,
      website: company.website,
    });
    setEditingId(company._id);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateCompany(editingId, form);
      } else {
        await createCompany(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this company? This cannot be undone.')) return;
    try {
      await deleteCompany(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company.');
    }
  };

  const inputClass =
    'w-full bg-ink border border-line px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-signal';

  return (
    <>
      <Navbar title="Companies" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-signal text-ink font-medium px-4 py-2 text-sm hover:bg-signal-deep transition-colors"
          >
            <Plus size={16} /> Add Company
          </button>
        </div>

        {loading ? (
          <p className="text-fog">Loading companies...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <div key={c._id} className="border border-line bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg text-paper">{c.name}</h3>
                    <p className="text-xs text-fog mt-0.5">{c.industry}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-fog hover:text-signal">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="text-fog hover:text-blocked">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {c.description && <p className="text-sm text-fog mt-3">{c.description}</p>}
                {c.website && <p className="text-sm text-signal mt-2">{c.website}</p>}
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-line w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-paper">
                  {editingId ? 'Edit Company' : 'Add Company'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-fog hover:text-paper">
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="mb-4 border border-blocked/40 text-blocked text-sm px-3 py-2">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  placeholder="Company name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Industry"
                  className={inputClass}
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  rows={3}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                  placeholder="Website"
                  className={inputClass}
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-signal text-ink font-medium py-2.5 text-sm hover:bg-signal-deep transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Company' : 'Create Company'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
