const features = [
  {
    title: "Fit Matching",
    description:
      "We analyze last width, volume, and instep height to ensure the same comfortable fit.",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M6 18h12M7 18l4-7 4 7 2-4 2 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    title: "Performance Sync",
    description:
      "Match flex index and stiffness so your skiing style translates perfectly.",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    title: "Current Models",
    description:
      "Find the modern equivalent of older rental fleet models that you already trust.",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M6 8h8l4 4-4 4H6z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M6 8v8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
];

export default function FeatureCards() {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <div key={feature.title} className="card feature-card">
          <div className="feature-icon" aria-hidden="true">
            {feature.icon}
          </div>
          <h3>{feature.title}</h3>
          <p className="notice">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
