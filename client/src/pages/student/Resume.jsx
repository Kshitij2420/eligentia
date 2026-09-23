import { useEffect, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getResume, uploadResume } from '../../services/api';

export default function Resume() {
  const [resume, setResume] = useState(null);
  const [completeness, setCompleteness] = useState({ score: 0, suggestions: [] });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const load = () => {
    getResume().then((res) => {
      setResume(res.data.resume);
      setCompleteness(res.data.completeness);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await uploadResume(formData);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try a PDF or DOCX under 5MB.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <>
      <Navbar title="Resume" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Upload Resume</h2>

            {error && (
              <div className="mb-4 border border-blocked/40 text-blocked text-sm px-3 py-2">{error}</div>
            )}

            {resume ? (
              <div className="flex items-center gap-3 border border-line p-4 mb-4">
                <FileText className="text-signal shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-paper text-sm truncate">{resume.fileName}</p>
                  <p className="text-xs text-fog mt-0.5">
                    Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle2 className="text-eligible shrink-0" size={18} />
              </div>
            ) : (
              <p className="text-fog text-sm mb-4">No resume uploaded yet.</p>
            )}

            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-line py-8 cursor-pointer hover:border-signal/50 transition-colors">
              <UploadCloud className="text-fog" size={24} />
              <span className="text-sm text-fog">
                {uploading ? 'Uploading...' : 'Click to upload PDF or DOCX (max 5MB)'}
              </span>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>

            {resume?.extractedSkills?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-fog mb-2">Skills detected in resume text</p>
                <div className="flex flex-wrap gap-2">
                  {resume.extractedSkills.map((s) => (
                    <span key={s} className="text-xs border border-line text-fog px-2 py-0.5 capitalize">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="border border-line bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-paper">Resume Completeness</h2>
              <span className="font-display text-2xl text-signal">{completeness.score}%</span>
            </div>
            <div className="w-full h-2 bg-ink border border-line mb-4">
              <div
                className="h-full bg-signal transition-all"
                style={{ width: `${completeness.score}%` }}
              />
            </div>
            {completeness.suggestions?.length > 0 && (
              <div>
                <p className="text-sm text-fog mb-2">Suggestions</p>
                <ul className="space-y-1.5">
                  {completeness.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-paper flex gap-2">
                      <span className="text-signal">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
