export default function SkillGap({ matched = [], missing = [] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <p className="text-sm text-fog mb-2">Matched skills</p>
        <div className="flex flex-wrap gap-2">
          {matched.length === 0 && <span className="text-sm text-fog">None yet</span>}
          {matched.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 border border-eligible/40 text-eligible text-sm px-2.5 py-1"
            >
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-fog mb-2">Missing skills</p>
        <div className="flex flex-wrap gap-2">
          {missing.length === 0 && <span className="text-sm text-fog">None — full coverage</span>}
          {missing.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 border border-blocked/40 text-blocked text-sm px-2.5 py-1"
            >
              ⚠ {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
