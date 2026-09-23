/**
 * MatchScore - the signature visual element of ELIGENTIA.
 * A hand-built circular gauge (not a chart library default) that renders any
 * 0-100 score as an arc, with the number set in Fraunces at its center.
 */
export default function MatchScore({ value = 0, size = 120, label, tone = 'signal' }) {
  const strokeWidth = size * 0.09;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  const toneColors = {
    signal: '#F2B705',
    eligible: '#34D399',
    blocked: '#FB7185',
  };
  const color = toneColors[tone] || toneColors.signal;

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#252E42"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-medium text-paper" style={{ fontSize: size * 0.28 }}>
            {clamped}
          </span>
        </div>
      </div>
      {label && <span className="mt-2 text-sm text-fog text-center">{label}</span>}
    </div>
  );
}
