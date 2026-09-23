import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import MatchScore from '../../components/MatchScore';
import SkillGap from '../../components/SkillGap';
import { getPlacementById, getMatch, applyToPlacement, getMyApplications } from '../../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getPlacementById(id), getMatch(id), getMyApplications()])
      .then(([jobRes, matchRes, appsRes]) => {
        setJob(jobRes.data.placement);
        setMatch(matchRes.data);
        setAlreadyApplied(appsRes.data.applications.some((a) => a.placementDriveId?._id === id));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load job details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      await applyToPlacement(id);
      setSuccess(true);
      setAlreadyApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Job Details" />
        <main className="flex-1 p-6">
          <p className="text-fog">Loading...</p>
        </main>
      </>
    );
  }

  if (!job || !match) {
    return (
      <>
        <Navbar title="Job Details" />
        <main className="flex-1 p-6">
          <p className="text-blocked">{error || 'Job not found.'}</p>
        </main>
      </>
    );
  }

  const eligible = match.eligibility.status === 'eligible';
  const deadline = new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <Navbar title={job.title} />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {/* Header */}
          <section className="border border-line bg-surface p-6">
            <p className="text-fog text-sm">{job.companyId?.name}</p>
            <h1 className="font-display text-2xl text-paper mt-1">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-fog">
              {job.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} /> {job.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} /> Apply by {deadline}
              </span>
              {job.package && <span>{job.package}</span>}
            </div>
            {job.description && <p className="text-paper text-sm mt-4 leading-relaxed">{job.description}</p>}
          </section>

          {/* Eligibility + Match hero */}
          <section className="border border-line bg-surface p-6">
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-fog text-sm mb-2">Your Eligibility</p>
                <div
                  className={`inline-flex items-center gap-2 text-lg font-display ${
                    eligible ? 'text-eligible' : 'text-blocked'
                  }`}
                >
                  {eligible ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  {eligible ? 'Eligible' : 'Not Eligible'}
                </div>
                {!eligible && match.eligibility.reasons?.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {match.eligibility.reasons.map((r, i) => (
                      <li key={i} className="text-sm text-fog">
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex justify-center sm:justify-end">
                <MatchScore
                  value={match.matchPercentage}
                  size={130}
                  label="Your Match"
                  tone={eligible ? 'eligible' : 'signal'}
                />
              </div>
            </div>
          </section>

          {/* Skill gap */}
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Skills Breakdown</h2>
            <SkillGap matched={match.matchedSkills} missing={match.missingSkills} />
          </section>

          {/* Improve */}
          {match.improvementSuggestions?.length > 0 && (
            <section className="border border-line bg-surface p-6">
              <h2 className="font-display text-lg text-paper mb-1">Improve Your Match</h2>
              <p className="text-xs text-fog mb-4">Estimated improvement based on the matching algorithm.</p>
              <div className="space-y-3">
                {match.improvementSuggestions.map((s) => (
                  <div key={s.skill} className="border border-line p-4">
                    <p className="text-paper text-sm font-medium">{s.skill}</p>
                    <p className="text-sm text-fog mt-1">{s.advice}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Score breakdown */}
          <section className="border border-line bg-surface p-6">
            <h2 className="font-display text-lg text-paper mb-4">Match Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(match.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-fog capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-paper">{value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-ink border border-line">
                    <div className="h-full bg-signal" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && <div className="border border-blocked/40 text-blocked text-sm px-3 py-2">{error}</div>}
          {success && (
            <div className="border border-eligible/40 text-eligible text-sm px-3 py-2">
              Application submitted successfully!
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={!eligible || alreadyApplied || applying}
              className="bg-signal text-ink font-medium px-6 py-2.5 text-sm hover:bg-signal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {alreadyApplied ? 'Already Applied' : applying ? 'Applying...' : 'Apply Now'}
            </button>
            <button
              onClick={() => navigate('/student/jobs')}
              className="border border-line text-fog px-6 py-2.5 text-sm hover:text-paper transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
