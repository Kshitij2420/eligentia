import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import JobCard from '../../components/JobCard';
import { getPlacements } from '../../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | eligible

  useEffect(() => {
    getPlacements()
      .then((res) => setJobs(res.data.placements))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'eligible' ? jobs.filter((j) => j.eligibilityStatus === 'eligible') : jobs;

  const sorted = [...filtered].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

  return (
    <>
      <Navbar title="Placement Opportunities" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          {['all', 'eligible'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm border capitalize transition-colors ${
                filter === f ? 'border-signal text-signal' : 'border-line text-fog hover:text-paper'
              }`}
            >
              {f === 'all' ? 'All jobs' : 'Eligible only'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-fog">Loading opportunities...</p>
        ) : sorted.length === 0 ? (
          <p className="text-fog text-sm">No placement drives match this filter.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sorted.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
