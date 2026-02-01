export default function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 28 28" role="presentation">
          <rect x="1" y="1" width="26" height="26" rx="8" fill="currentColor" />
          <path
            d="M7 19l4-7 4 6 3-5 3 6"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="logo-text">BootMatch</span>
    </span>
  );
}
