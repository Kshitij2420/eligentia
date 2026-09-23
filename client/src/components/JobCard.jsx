import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

export default function JobCard({ job }) {
  const eligible = job.eligibilityStatus === 'eligible';
  const deadline = new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Link
      to={`/student/jobs/${job._id}`}
      className="block border border-line bg-surface p-5 hover:border-signal/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-fog text-sm">{job.company?.name}</p>
          <h3 className="font-display text-lg text-paper mt-0.5">{job.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-fog">
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {job.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> Apply by {deadline}
            </span>
          </div>
          {job.package && <p className="text-sm text-fog mt-1">{job.package}</p>}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-display text-2xl text-signal">{job.matchPercentage ?? '--'}%</span>
          <span
            className={`text-xs px-2 py-0.5 border ${
              eligible ? 'border-eligible/40 text-eligible' : 'border-blocked/40 text-blocked'
            }`}
          >
            {eligible ? 'Eligible' : 'Not Eligible'}
          </span>
        </div>
      </div>
    </Link>
  );
}
