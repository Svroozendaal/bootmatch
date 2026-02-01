export default function Hero() {
  return (
    <div className="hero-copy">
      <div className="pill">
        <span className="pill-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" role="presentation">
            <path
              d="M10 3l1.4 3.4L15 8l-3.6 1.6L10 13l-1.4-3.4L5 8l3.6-1.6L10 3z"
              fill="currentColor"
            />
          </svg>
        </span>
        Find your perfect ski boot replacement
      </div>
      <h1 className="hero-title">
        Replace your rental boots
        <br />
        with <span className="accent">confidence.</span>
      </h1>
      <p className="hero-subtitle">
        Enter the ski boot you loved renting, and we will match its fit and
        performance to the best boots available to buy today.
      </p>
    </div>
  );
}
